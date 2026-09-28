"""
Multi-pass candidate generation (blocking) module.
Implements selective, country-aware, candidate-capped inverted indexing
with document-frequency controls and multilingual character n-gram retrieval.
"""

import sqlite3
from array import array
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple, Union

import pandas as pd

try:
    from .config import (
        ADDR_NUM_TOKEN_MAX_DF,
        ADDR_TOKEN_MAX_DF,
        BUCKET_CAP_ADDR,
        BUCKET_CAP_COMPOSITE,
        BUCKET_CAP_PREFIX,
        BUCKET_CAP_TOKEN,
        CHUNK_SIZE,
        MAX_CANDIDATES_PER_S1_BLOCK,
        MAX_NGRAM_CANDIDATES_PER_S1,
        MAX_TOTAL_CANDIDATES_PER_S1,
        NAME_TOKEN_MAX_DF,
        NGRAM_MAX_DF,
    )
    from .normalization import PreprocessedEntity
except (ImportError, ValueError):
    from config import (
        ADDR_NUM_TOKEN_MAX_DF,
        ADDR_TOKEN_MAX_DF,
        BUCKET_CAP_ADDR,
        BUCKET_CAP_COMPOSITE,
        BUCKET_CAP_PREFIX,
        BUCKET_CAP_TOKEN,
        CHUNK_SIZE,
        MAX_CANDIDATES_PER_S1_BLOCK,
        MAX_NGRAM_CANDIDATES_PER_S1,
        MAX_TOTAL_CANDIDATES_PER_S1,
        NAME_TOKEN_MAX_DF,
        NGRAM_MAX_DF,
    )
    from normalization import PreprocessedEntity


@dataclass
class CandidateHit:
    """Stores a candidate target ID and the blocking passes that retrieved it."""
    target_id: str
    hit_passes: Set[str] = field(default_factory=set)


def priority_sort_key(c_hit: CandidateHit) -> int:
    """Priority scoring function for ranking candidates across blocking passes."""
    passes = c_hit.hit_passes
    score = len(passes) * 10
    if "B1_exact_name" in passes:
        score += 50
    if "B4_exact_addr" in passes:
        score += 40
    if "B7_name_tok_addr_num" in passes or "B8_prefix_postal" in passes:
        score += 30
    if "B6_addr_num_token" in passes:
        score += 20
    return score


class MultiPassBlocker:
    """Selective multi-pass inverted index blocker with candidate explosion safeguards."""

    def __init__(self):
        # Inverted index tables: mapping (country, key) -> list of target_ids
        self.exact_name_idx: Dict[Tuple[str, str], List[str]] = defaultdict(list)
        self.name_token_idx: Dict[Tuple[str, str], List[str]] = defaultdict(list)
        self.name_prefix_idx: Dict[Tuple[str, str], List[str]] = defaultdict(list)
        self.exact_addr_idx: Dict[Tuple[str, str], List[str]] = defaultdict(list)
        self.addr_token_idx: Dict[Tuple[str, str], List[str]] = defaultdict(list)
        self.addr_num_tok_idx: Dict[Tuple[str, str], List[str]] = defaultdict(list)
        self.name_tok_addr_num_idx: Dict[Tuple[str, str], List[str]] = defaultdict(list)
        self.prefix_postal_idx: Dict[Tuple[str, str], List[str]] = defaultdict(list)
        self.char_ngram_idx: Dict[Tuple[str, str], List[str]] = defaultdict(list)

        # Token document frequency trackers
        self.name_token_df: Counter = Counter()
        self.addr_token_df: Counter = Counter()
        self.addr_num_tok_df: Counter = Counter()
        self.char_ngram_df: Counter = Counter()

        # Indexed target records dictionary: target_id -> PreprocessedEntity
        self.indexed_targets: Dict[str, PreprocessedEntity] = {}

    def index_target_entity(self, target: PreprocessedEntity) -> None:
        """Indexes a single preprocessed target record into all blocking passes."""
        tid = target.entity_id
        country = target.country
        self.indexed_targets[tid] = target

        # Pass 1: Exact Name (B1)
        if target.norm_name:
            key = (country, target.norm_name)
            if len(self.exact_name_idx[key]) < BUCKET_CAP_TOKEN:
                self.exact_name_idx[key].append(tid)

        # Pass 2: Informative Name Tokens (B2)
        for tok in target.informative_name_tokens:
            key = (country, tok)
            self.name_token_df[key] += 1
            if len(self.name_token_idx[key]) < BUCKET_CAP_TOKEN:
                self.name_token_idx[key].append(tid)

        # Pass 3: Name Prefix (B3) (first 5 chars)
        if target.norm_name and len(target.norm_name) >= 5:
            prefix = target.norm_name[:5]
            key = (country, prefix)
            if len(self.name_prefix_idx[key]) < BUCKET_CAP_PREFIX:
                self.name_prefix_idx[key].append(tid)

        # Pass 4: Exact Address (B4)
        if target.norm_addr:
            key = (country, target.norm_addr)
            if len(self.exact_addr_idx[key]) < BUCKET_CAP_ADDR:
                self.exact_addr_idx[key].append(tid)

        # Pass 5: Rare Address Tokens (B5)
        for tok in target.informative_addr_tokens:
            key = (country, tok)
            self.addr_token_df[key] += 1
            if len(self.addr_token_idx[key]) < BUCKET_CAP_ADDR:
                self.addr_token_idx[key].append(tid)

        # Pass 6: Address Number + Informative Token (B6)
        if target.numeric_addr_tokens and target.informative_addr_tokens:
            for num in target.numeric_addr_tokens[:2]:
                for tok in target.informative_addr_tokens[:2]:
                    comp_key = (country, f"{num}_{tok}")
                    self.addr_num_tok_df[comp_key] += 1
                    if len(self.addr_num_tok_idx[comp_key]) < BUCKET_CAP_COMPOSITE:
                        self.addr_num_tok_idx[comp_key].append(tid)

        # Pass 7: Name Token + Address Number (B7)
        if target.informative_name_tokens and target.numeric_addr_tokens:
            for n_tok in target.informative_name_tokens[:2]:
                for num in target.numeric_addr_tokens[:2]:
                    comp_key = (country, f"{n_tok}_{num}")
                    if len(self.name_tok_addr_num_idx[comp_key]) < BUCKET_CAP_COMPOSITE:
                        self.name_tok_addr_num_idx[comp_key].append(tid)

        # Pass 8: Name Prefix + Postal Code (B8)
        if target.norm_name and len(target.norm_name) >= 4 and target.postal_addr_tokens:
            prefix4 = target.norm_name[:4]
            for post in target.postal_addr_tokens[:2]:
                comp_key = (country, f"{prefix4}_{post}")
                if len(self.prefix_postal_idx[comp_key]) < BUCKET_CAP_COMPOSITE:
                    self.prefix_postal_idx[comp_key].append(tid)

        # Pass 9: Character 2/3-Grams (B9)
        ngrams = target.name_2grams | target.name_3grams
        for ng in ngrams:
            key = (country, ng)
            self.char_ngram_df[key] += 1
            if len(self.char_ngram_idx[key]) < BUCKET_CAP_TOKEN:
                self.char_ngram_idx[key].append(tid)

    def retrieve_candidates(self, s1: PreprocessedEntity, max_candidates: Optional[int] = None) -> Dict[str, CandidateHit]:
        """Retrieves candidate target entities for an S1 reference record across all passes.

        Returns:
            Dict mapping target_id -> CandidateHit(target_id, hit_passes)
        """
        candidates: Dict[str, CandidateHit] = {}
        country = s1.country

        def add_hit(tid: str, pass_name: str) -> None:
            if tid not in candidates:
                candidates[tid] = CandidateHit(target_id=tid, hit_passes={pass_name})
            else:
                candidates[tid].hit_passes.add(pass_name)

        # Pass 1: Exact Name (B1)
        if s1.norm_name:
            tids = self.exact_name_idx.get((country, s1.norm_name), [])
            for tid in tids[:MAX_CANDIDATES_PER_S1_BLOCK]:
                add_hit(tid, "B1_exact_name")

        # Pass 2: Rare Name Tokens (B2) with DF <= NAME_TOKEN_MAX_DF
        b2_count = 0
        for tok in s1.informative_name_tokens:
            key = (country, tok)
            if self.name_token_df.get(key, 0) <= NAME_TOKEN_MAX_DF:
                tids = self.name_token_idx.get(key, [])
                for tid in tids:
                    add_hit(tid, "B2_name_token")
                    b2_count += 1
                    if b2_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                        break
            if b2_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                break

        # Pass 3: Name Prefix (B3) (first 5 chars)
        if s1.norm_name and len(s1.norm_name) >= 5:
            prefix = s1.norm_name[:5]
            tids = self.name_prefix_idx.get((country, prefix), [])
            for tid in tids[:MAX_CANDIDATES_PER_S1_BLOCK]:
                add_hit(tid, "B3_name_prefix")

        # Pass 4: Exact Address (B4)
        if s1.norm_addr:
            tids = self.exact_addr_idx.get((country, s1.norm_addr), [])
            for tid in tids[:MAX_CANDIDATES_PER_S1_BLOCK]:
                add_hit(tid, "B4_exact_addr")

        # Pass 5: Rare Address Tokens (B5) with DF <= ADDR_TOKEN_MAX_DF
        b5_count = 0
        for tok in s1.informative_addr_tokens:
            key = (country, tok)
            if self.addr_token_df.get(key, 0) <= ADDR_TOKEN_MAX_DF:
                tids = self.addr_token_idx.get(key, [])
                for tid in tids:
                    add_hit(tid, "B5_addr_token")
                    b5_count += 1
                    if b5_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                        break
            if b5_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                break

        # Pass 6: Address Number + Informative Token (B6)
        if s1.numeric_addr_tokens and s1.informative_addr_tokens:
            b6_count = 0
            for num in s1.numeric_addr_tokens[:2]:
                for tok in s1.informative_addr_tokens[:2]:
                    comp_key = (country, f"{num}_{tok}")
                    if self.addr_num_tok_df.get(comp_key, 0) <= ADDR_NUM_TOKEN_MAX_DF:
                        tids = self.addr_num_tok_idx.get(comp_key, [])
                        for tid in tids:
                            add_hit(tid, "B6_addr_num_token")
                            b6_count += 1
                            if b6_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                                break
                    if b6_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                        break
                if b6_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                    break

        # Pass 7: Name Token + Address Number (B7)
        if s1.informative_name_tokens and s1.numeric_addr_tokens:
            b7_count = 0
            for n_tok in s1.informative_name_tokens[:2]:
                for num in s1.numeric_addr_tokens[:2]:
                    comp_key = (country, f"{n_tok}_{num}")
                    tids = self.name_tok_addr_num_idx.get(comp_key, [])
                    for tid in tids:
                        add_hit(tid, "B7_name_tok_addr_num")
                        b7_count += 1
                        if b7_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                            break
                    if b7_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                        break
                if b7_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                    break

        # Pass 8: Name Prefix + Postal Code (B8)
        if s1.norm_name and len(s1.norm_name) >= 4 and s1.postal_addr_tokens:
            prefix4 = s1.norm_name[:4]
            for post in s1.postal_addr_tokens[:2]:
                comp_key = (country, f"{prefix4}_{post}")
                tids = self.prefix_postal_idx.get(comp_key, [])
                for tid in tids[:MAX_CANDIDATES_PER_S1_BLOCK]:
                    add_hit(tid, "B8_prefix_postal")

        # Pass 9: Multilingual / Transliteration Character N-Grams (B9)
        # Uses conservative overlap: requires at least 2 common n-grams with DF <= NGRAM_MAX_DF
        ngram_overlap: Counter = Counter()
        s1_ngrams = s1.name_2grams | s1.name_3grams
        for ng in s1_ngrams:
            key = (country, ng)
            if self.char_ngram_df.get(key, 0) <= NGRAM_MAX_DF:
                for tid in self.char_ngram_idx.get(key, []):
                    ngram_overlap[tid] += 1

        b9_count = 0
        for tid, overlap in ngram_overlap.most_common(MAX_NGRAM_CANDIDATES_PER_S1):
            if overlap >= 2:
                add_hit(tid, "B9_char_ngram")
                b9_count += 1
                if b9_count >= MAX_NGRAM_CANDIDATES_PER_S1:
                    break

        # Limit total candidates per S1 if needed
        effective_cap = max_candidates if max_candidates is not None else MAX_TOTAL_CANDIDATES_PER_S1
        if len(candidates) > effective_cap:
            sorted_hits = sorted(candidates.values(), key=priority_sort_key, reverse=True)
            candidates = {h.target_id: h for h in sorted_hits[:effective_cap]}

        return candidates


# ==============================================================================
# COMPACT DISK-BACKED BLOCKER FOR FULL-SCALE INFERENCE
# ==============================================================================

class CompactDiskBlocker:
    """Production disk-backed blocker querying SQLite packed BLOB postings with compact integer IDs.

    Guarantees:
    - Zero target Python objects held permanently in RAM.
    - Exact candidate equivalence with MultiPassBlocker.
    - On-demand target record retrieval for model scoring.
    - Sub-millisecond candidate retrieval via SQLite memory-mapped binary buffers.
    """

    def __init__(self, db_path: Union[str, Path], read_only: bool = False):
        self.db_path = Path(db_path)
        if not self.db_path.exists():
            raise FileNotFoundError(f"Target index database not found at {self.db_path}")

        if read_only:
            uri_path = self.db_path.resolve().as_uri() + "?mode=ro"
            self.conn = sqlite3.connect(uri_path, uri=True)
            self.cur = self.conn.cursor()
            self.cur.execute("PRAGMA query_only = ON")
        else:
            self.conn = sqlite3.connect(str(self.db_path))
            self.cur = self.conn.cursor()
            self.cur.execute("PRAGMA journal_mode = OFF")
        self.cur.execute("PRAGMA synchronous = OFF")
        self.cur.execute("PRAGMA mmap_size = 268435456")  # 256 MB memory-mapped I/O
        self.cur.execute("PRAGMA cache_size = -64000")    # 64 MB page cache

        # Cache int_id -> entity_id map in memory (~350 MB for 10M records)
        id_cur = self.conn.cursor()
        id_cur.execute("SELECT id, entity_id FROM target_records")
        self.int_to_str_id: Dict[int, str] = {row[0]: row[1] for row in id_cur.fetchall()}
        id_cur.close()

    def retrieve_candidates(self, s1: PreprocessedEntity, max_candidates: Optional[int] = None) -> Dict[str, CandidateHit]:
        """Retrieves candidates for S1 across all 9 passes from disk-backed index."""
        candidates: Dict[int, Set[str]] = {}
        c = s1.country

        def add_int_hit(tid_int: int, pass_name: str) -> None:
            if tid_int not in candidates:
                candidates[tid_int] = {pass_name}
            else:
                candidates[tid_int].add(pass_name)

        def unpack_postings(blob_bytes: bytes) -> array:
            a = array("I")
            a.frombytes(blob_bytes)
            return a

        # Pass 1: Exact Name (B1)
        if s1.norm_name:
            self.cur.execute(
                "SELECT postings FROM postings WHERE pass_id = 1 AND country = ? AND key = ?",
                (c, s1.norm_name)
            )
            row = self.cur.fetchone()
            if row:
                for tid_int in unpack_postings(row[0])[:MAX_CANDIDATES_PER_S1_BLOCK]:
                    add_int_hit(tid_int, "B1_exact_name")

        # Pass 2: Rare Name Tokens (B2) with DF <= NAME_TOKEN_MAX_DF
        if s1.informative_name_tokens:
            toks = s1.informative_name_tokens
            placeholders = ",".join(["?"] * len(toks))
            self.cur.execute(
                f"SELECT key, df, postings FROM postings WHERE pass_id = 2 AND country = ? AND key IN ({placeholders})",
                [c] + toks
            )
            b2_dict = {r[0]: (r[1], r[2]) for r in self.cur.fetchall()}
            b2_count = 0
            for tok in toks:
                if tok in b2_dict:
                    df, blob = b2_dict[tok]
                    if df <= NAME_TOKEN_MAX_DF:
                        for tid_int in unpack_postings(blob):
                            add_int_hit(tid_int, "B2_name_token")
                            b2_count += 1
                            if b2_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                                break
                if b2_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                    break

        # Pass 3: Name Prefix (B3) (first 5 chars)
        if s1.norm_name and len(s1.norm_name) >= 5:
            prefix = s1.norm_name[:5]
            self.cur.execute(
                "SELECT postings FROM postings WHERE pass_id = 3 AND country = ? AND key = ?",
                (c, prefix)
            )
            row = self.cur.fetchone()
            if row:
                for tid_int in unpack_postings(row[0])[:MAX_CANDIDATES_PER_S1_BLOCK]:
                    add_int_hit(tid_int, "B3_name_prefix")

        # Pass 4: Exact Address (B4)
        if s1.norm_addr:
            self.cur.execute(
                "SELECT postings FROM postings WHERE pass_id = 4 AND country = ? AND key = ?",
                (c, s1.norm_addr)
            )
            row = self.cur.fetchone()
            if row:
                for tid_int in unpack_postings(row[0])[:MAX_CANDIDATES_PER_S1_BLOCK]:
                    add_int_hit(tid_int, "B4_exact_addr")

        # Pass 5: Rare Address Tokens (B5) with DF <= ADDR_TOKEN_MAX_DF
        if s1.informative_addr_tokens:
            toks = s1.informative_addr_tokens
            placeholders = ",".join(["?"] * len(toks))
            self.cur.execute(
                f"SELECT key, df, postings FROM postings WHERE pass_id = 5 AND country = ? AND key IN ({placeholders})",
                [c] + toks
            )
            b5_dict = {r[0]: (r[1], r[2]) for r in self.cur.fetchall()}
            b5_count = 0
            for tok in toks:
                if tok in b5_dict:
                    df, blob = b5_dict[tok]
                    if df <= ADDR_TOKEN_MAX_DF:
                        for tid_int in unpack_postings(blob):
                            add_int_hit(tid_int, "B5_addr_token")
                            b5_count += 1
                            if b5_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                                break
                if b5_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                    break

        # Pass 6: Address Number + Informative Token (B6)
        if s1.numeric_addr_tokens and s1.informative_addr_tokens:
            b6_keys = []
            for num in s1.numeric_addr_tokens[:2]:
                for tok in s1.informative_addr_tokens[:2]:
                    b6_keys.append(f"{num}_{tok}")
            if b6_keys:
                placeholders = ",".join(["?"] * len(b6_keys))
                self.cur.execute(
                    f"SELECT key, df, postings FROM postings WHERE pass_id = 6 AND country = ? AND key IN ({placeholders})",
                    [c] + b6_keys
                )
                b6_dict = {r[0]: (r[1], r[2]) for r in self.cur.fetchall()}
                b6_count = 0
                for comp_key in b6_keys:
                    if comp_key in b6_dict:
                        df, blob = b6_dict[comp_key]
                        if df <= ADDR_NUM_TOKEN_MAX_DF:
                            for tid_int in unpack_postings(blob):
                                add_int_hit(tid_int, "B6_addr_num_token")
                                b6_count += 1
                                if b6_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                                    break
                    if b6_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                        break

        # Pass 7: Name Token + Address Number (B7)
        if s1.informative_name_tokens and s1.numeric_addr_tokens:
            b7_keys = []
            for n_tok in s1.informative_name_tokens[:2]:
                for num in s1.numeric_addr_tokens[:2]:
                    b7_keys.append(f"{n_tok}_{num}")
            if b7_keys:
                placeholders = ",".join(["?"] * len(b7_keys))
                self.cur.execute(
                    f"SELECT key, postings FROM postings WHERE pass_id = 7 AND country = ? AND key IN ({placeholders})",
                    [c] + b7_keys
                )
                b7_dict = {r[0]: r[1] for r in self.cur.fetchall()}
                b7_count = 0
                for comp_key in b7_keys:
                    if comp_key in b7_dict:
                        blob = b7_dict[comp_key]
                        for tid_int in unpack_postings(blob):
                            add_int_hit(tid_int, "B7_name_tok_addr_num")
                            b7_count += 1
                            if b7_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                                break
                    if b7_count >= MAX_CANDIDATES_PER_S1_BLOCK:
                        break

        # Pass 8: Name Prefix + Postal Code (B8)
        if s1.norm_name and len(s1.norm_name) >= 4 and s1.postal_addr_tokens:
            prefix4 = s1.norm_name[:4]
            b8_keys = [f"{prefix4}_{post}" for post in s1.postal_addr_tokens[:2]]
            if b8_keys:
                placeholders = ",".join(["?"] * len(b8_keys))
                self.cur.execute(
                    f"SELECT key, postings FROM postings WHERE pass_id = 8 AND country = ? AND key IN ({placeholders})",
                    [c] + b8_keys
                )
                b8_dict = {r[0]: r[1] for r in self.cur.fetchall()}
                for comp_key in b8_keys:
                    if comp_key in b8_dict:
                        blob = b8_dict[comp_key]
                        for tid_int in unpack_postings(blob)[:MAX_CANDIDATES_PER_S1_BLOCK]:
                            add_int_hit(tid_int, "B8_prefix_postal")

        # Pass 9: Multilingual / Transliteration Character N-Grams (B9)
        s1_ngrams = list(s1.name_2grams | s1.name_3grams)
        if s1_ngrams:
            placeholders = ",".join(["?"] * len(s1_ngrams))
            self.cur.execute(
                f"SELECT key, df, postings FROM postings WHERE pass_id = 9 AND country = ? AND key IN ({placeholders})",
                [c] + s1_ngrams
            )
            ngram_overlap = Counter()
            for r in self.cur.fetchall():
                df, blob = r[1], r[2]
                if df <= NGRAM_MAX_DF:
                    for tid_int in unpack_postings(blob):
                        ngram_overlap[tid_int] += 1

            b9_count = 0
            for tid_int, overlap in ngram_overlap.most_common(MAX_NGRAM_CANDIDATES_PER_S1):
                if overlap >= 2:
                    add_int_hit(tid_int, "B9_char_ngram")
                    b9_count += 1
                    if b9_count >= MAX_NGRAM_CANDIDATES_PER_S1:
                        break

        # Convert to CandidateHit with string IDs
        hit_objects = [
            CandidateHit(target_id=self.int_to_str_id[tid_int], hit_passes=passes)
            for tid_int, passes in candidates.items()
            if tid_int in self.int_to_str_id
        ]

        effective_cap = max_candidates if max_candidates is not None else MAX_TOTAL_CANDIDATES_PER_S1
        if len(hit_objects) > effective_cap:
            sorted_hits = sorted(hit_objects, key=priority_sort_key, reverse=True)
            capped_hits = sorted_hits[:effective_cap]
            return {h.target_id: h for h in capped_hits}
        else:
            return {h.target_id: h for h in hit_objects}

    def fetch_target_entities(self, target_ids: Set[str]) -> Dict[str, PreprocessedEntity]:
        """Fetches raw target records by entity_id on-demand and parses them into PreprocessedEntity."""
        if not target_ids:
            return {}
        placeholders = ",".join(["?"] * len(target_ids))
        self.cur.execute(
            f"SELECT entity_id, name, addr, country FROM target_records WHERE entity_id IN ({placeholders})",
            list(target_ids)
        )
        entities = {}
        for r in self.cur.fetchall():
            pe = PreprocessedEntity.from_raw(r[0], r[1], r[2], r[3])
            entities[pe.entity_id] = pe
        return entities

    def close(self) -> None:
        """Closes the underlying SQLite database connection."""
        if self.conn:
            self.conn.close()


def build_compact_disk_index(
    source2_path: Path,
    source3_path: Path,
    db_path: Path,
    max_targets_per_source: Optional[int] = None,
    chunk_size: int = CHUNK_SIZE
) -> CompactDiskBlocker:
    """Builds the compact disk-backed SQLite inverted index from Source 2 and Source 3 target files.

    Args:
        source2_path: Path to source2 TSV
        source3_path: Path to source3 TSV
        db_path: Destination SQLite database file path
        max_targets_per_source: Optional limit for testing/benchmarking (None = full dataset)
        chunk_size: Streaming chunk size in rows

    Returns:
        CompactDiskBlocker ready for candidate queries and target retrieval
    """
    db_path = Path(db_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    if db_path.exists():
        db_path.unlink()

    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    cur.execute("PRAGMA synchronous = OFF")
    cur.execute("PRAGMA journal_mode = OFF")
    cur.execute("PRAGMA cache_size = -64000")

    cur.execute("""
    CREATE TABLE target_records (
        id INTEGER PRIMARY KEY,
        entity_id TEXT,
        name TEXT,
        addr TEXT,
        country TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE postings (
        pass_id INTEGER,
        country TEXT,
        key TEXT,
        df INTEGER,
        postings BLOB,
        PRIMARY KEY (pass_id, country, key)
    ) WITHOUT ROWID
    """)

    exact_name_idx: Dict[Tuple[str, str], array] = defaultdict(lambda: array("I"))
    name_token_idx: Dict[Tuple[str, str], array] = defaultdict(lambda: array("I"))
    name_prefix_idx: Dict[Tuple[str, str], array] = defaultdict(lambda: array("I"))
    exact_addr_idx: Dict[Tuple[str, str], array] = defaultdict(lambda: array("I"))
    addr_token_idx: Dict[Tuple[str, str], array] = defaultdict(lambda: array("I"))
    addr_num_tok_idx: Dict[Tuple[str, str], array] = defaultdict(lambda: array("I"))
    name_tok_addr_num_idx: Dict[Tuple[str, str], array] = defaultdict(lambda: array("I"))
    prefix_postal_idx: Dict[Tuple[str, str], array] = defaultdict(lambda: array("I"))
    char_ngram_idx: Dict[Tuple[str, str], array] = defaultdict(lambda: array("I"))

    name_token_df: Counter = Counter()
    addr_token_df: Counter = Counter()
    addr_num_tok_df: Counter = Counter()
    char_ngram_df: Counter = Counter()

    req_cols = ["entity_id", "business_name", "business_address", "country"]
    current_idx = 0

    print(f"Indexing targets to compact disk database: {db_path.name}...")

    for path, prefix in [(source2_path, "S2"), (source3_path, "S3")]:
        src_indexed = 0
        for chunk in pd.read_csv(path, sep="\t", usecols=req_cols, dtype=str, chunksize=chunk_size):
            if max_targets_per_source is not None and src_indexed >= max_targets_per_source:
                break
            if max_targets_per_source is not None and src_indexed + len(chunk) > max_targets_per_source:
                chunk = chunk.iloc[: max_targets_per_source - src_indexed]

            records_batch = []
            for row in chunk.itertuples(index=False):
                pe = PreprocessedEntity.from_raw(row.entity_id, row.business_name, row.business_address, row.country)
                idx = current_idx
                current_idx += 1
                src_indexed += 1
                c = pe.country

                records_batch.append((idx, pe.entity_id, pe.norm_name, pe.norm_addr, pe.country))

                if pe.norm_name:
                    k = (c, pe.norm_name)
                    if len(exact_name_idx[k]) < BUCKET_CAP_TOKEN: exact_name_idx[k].append(idx)

                for tok in pe.informative_name_tokens:
                    k = (c, tok)
                    name_token_df[k] += 1
                    if len(name_token_idx[k]) < BUCKET_CAP_TOKEN: name_token_idx[k].append(idx)

                if pe.norm_name and len(pe.norm_name) >= 5:
                    k = (c, pe.norm_name[:5])
                    if len(name_prefix_idx[k]) < BUCKET_CAP_PREFIX: name_prefix_idx[k].append(idx)

                if pe.norm_addr:
                    k = (c, pe.norm_addr)
                    if len(exact_addr_idx[k]) < BUCKET_CAP_ADDR: exact_addr_idx[k].append(idx)

                for tok in pe.informative_addr_tokens:
                    k = (c, tok)
                    addr_token_df[k] += 1
                    if len(addr_token_idx[k]) < BUCKET_CAP_ADDR: addr_token_idx[k].append(idx)

                if pe.numeric_addr_tokens and pe.informative_addr_tokens:
                    for num in pe.numeric_addr_tokens[:2]:
                        for tok in pe.informative_addr_tokens[:2]:
                            k = (c, f"{num}_{tok}")
                            addr_num_tok_df[k] += 1
                            if len(addr_num_tok_idx[k]) < BUCKET_CAP_COMPOSITE: addr_num_tok_idx[k].append(idx)

                if pe.informative_name_tokens and pe.numeric_addr_tokens:
                    for n_tok in pe.informative_name_tokens[:2]:
                        for num in pe.numeric_addr_tokens[:2]:
                            k = (c, f"{n_tok}_{num}")
                            if len(name_tok_addr_num_idx[k]) < BUCKET_CAP_COMPOSITE: name_tok_addr_num_idx[k].append(idx)

                if pe.norm_name and len(pe.norm_name) >= 4 and pe.postal_addr_tokens:
                    prefix4 = pe.norm_name[:4]
                    for post in pe.postal_addr_tokens[:2]:
                        k = (c, f"{prefix4}_{post}")
                        if len(prefix_postal_idx[k]) < BUCKET_CAP_COMPOSITE: prefix_postal_idx[k].append(idx)

                for ng in (pe.name_2grams | pe.name_3grams):
                    k = (c, ng)
                    char_ngram_df[k] += 1
                    if len(char_ngram_idx[k]) < BUCKET_CAP_TOKEN: char_ngram_idx[k].append(idx)

            cur.executemany("INSERT INTO target_records VALUES (?, ?, ?, ?, ?)", records_batch)

    print(f"Total target records inserted: {current_idx:,}. Building index on entity_id...")
    cur.execute("CREATE INDEX idx_target_eid ON target_records(entity_id)")
    conn.commit()

    # Insert postings into SQLite
    postings_batch = []
    def flush_postings():
        if postings_batch:
            cur.executemany("INSERT INTO postings VALUES (?, ?, ?, ?, ?)", postings_batch)
            postings_batch.clear()

    for (c, k), arr in exact_name_idx.items():
        postings_batch.append((1, c, k, len(arr), arr.tobytes()))
        if len(postings_batch) >= 50000: flush_postings()
    exact_name_idx.clear()

    for (c, k), arr in name_token_idx.items():
        postings_batch.append((2, c, k, name_token_df.get((c, k), len(arr)), arr.tobytes()))
        if len(postings_batch) >= 50000: flush_postings()
    name_token_idx.clear(); name_token_df.clear()

    for (c, k), arr in name_prefix_idx.items():
        postings_batch.append((3, c, k, len(arr), arr.tobytes()))
        if len(postings_batch) >= 50000: flush_postings()
    name_prefix_idx.clear()

    for (c, k), arr in exact_addr_idx.items():
        postings_batch.append((4, c, k, len(arr), arr.tobytes()))
        if len(postings_batch) >= 50000: flush_postings()
    exact_addr_idx.clear()

    for (c, k), arr in addr_token_idx.items():
        postings_batch.append((5, c, k, addr_token_df.get((c, k), len(arr)), arr.tobytes()))
        if len(postings_batch) >= 50000: flush_postings()
    addr_token_idx.clear(); addr_token_df.clear()

    for (c, k), arr in addr_num_tok_idx.items():
        postings_batch.append((6, c, k, addr_num_tok_df.get((c, k), len(arr)), arr.tobytes()))
        if len(postings_batch) >= 50000: flush_postings()
    addr_num_tok_idx.clear(); addr_num_tok_df.clear()

    for (c, k), arr in name_tok_addr_num_idx.items():
        postings_batch.append((7, c, k, len(arr), arr.tobytes()))
        if len(postings_batch) >= 50000: flush_postings()
    name_tok_addr_num_idx.clear()

    for (c, k), arr in prefix_postal_idx.items():
        postings_batch.append((8, c, k, len(arr), arr.tobytes()))
        if len(postings_batch) >= 50000: flush_postings()
    prefix_postal_idx.clear()

    for (c, k), arr in char_ngram_idx.items():
        postings_batch.append((9, c, k, char_ngram_df.get((c, k), len(arr)), arr.tobytes()))
        if len(postings_batch) >= 50000: flush_postings()
    char_ngram_idx.clear(); char_ngram_df.clear()

    flush_postings()
    conn.commit()
    conn.close()

    print(f"Successfully built compact disk index at {db_path} ({current_idx:,} records).")
    return CompactDiskBlocker(db_path)
