"""
Data loading and sampling module.
Memory-conscious chunked readers for training, validation, and inference.
"""

from pathlib import Path
from typing import Dict, Iterator, List, Optional, Set, Tuple

import pandas as pd

try:
    from .blocking import MultiPassBlocker
    from .config import CHUNK_SIZE, RANDOM_SEED
    from .normalization import PreprocessedEntity
except (ImportError, ValueError):
    from blocking import MultiPassBlocker
    from config import CHUNK_SIZE, RANDOM_SEED
    from normalization import PreprocessedEntity


# ==============================================================================
# GROUND TRUTH LOADERS
# ==============================================================================

def load_ground_truth_map(gt_path: Path) -> Dict[str, Set[str]]:
    """Loads ground truth into an in-memory dictionary: s1_id -> set of target_ids."""
    gt_map: Dict[str, Set[str]] = {}
    for chunk in pd.read_csv(
        gt_path,
        sep="\t",
        usecols=["source1_entity_id", "matched_entity_ids"],
        dtype=str,
        chunksize=CHUNK_SIZE,
    ):
        chunk["matched_entity_ids"] = chunk["matched_entity_ids"].fillna("").str.strip()
        for _, row in chunk.iterrows():
            s1_id = row["source1_entity_id"].strip()
            raw_matches = row["matched_entity_ids"]
            if raw_matches:
                matches = {m.strip() for m in raw_matches.split(",") if m.strip()}
                gt_map[s1_id] = matches
            else:
                gt_map[s1_id] = set()
    return gt_map


def sample_representative_s1(
    gt_path: Path,
    n_matched: int = 4000,
    n_zero: int = 1000,
    seed: int = RANDOM_SEED
) -> Tuple[List[str], Dict[str, Set[str]], Set[str]]:
    """Samples n_matched and n_zero S1 entities deterministically.

    Returns:
        sampled_s1_ids: list of all sampled S1 IDs
        gt_subset_map: mapping s1_id -> set(matched_target_ids) for sampled S1
        needed_target_ids: set of all true S2/S3 target IDs required by sampled S1
    """
    all_matched: List[Tuple[str, str]] = []
    all_zero: List[str] = []

    for chunk in pd.read_csv(
        gt_path,
        sep="\t",
        usecols=["source1_entity_id", "matched_entity_ids"],
        dtype=str,
        chunksize=CHUNK_SIZE,
    ):
        chunk["matched_entity_ids"] = chunk["matched_entity_ids"].fillna("").str.strip()
        for _, row in chunk.iterrows():
            s1 = row["source1_entity_id"].strip()
            m = row["matched_entity_ids"]
            if m:
                all_matched.append((s1, m))
            else:
                all_zero.append(s1)

    df_matched = pd.DataFrame(all_matched, columns=["source1_entity_id", "matched_entity_ids"])
    df_zero = pd.DataFrame(all_zero, columns=["source1_entity_id"])

    sampled_m = df_matched.sample(n=min(n_matched, len(df_matched)), random_state=seed)
    sampled_z = df_zero.sample(n=min(n_zero, len(df_zero)), random_state=seed)

    gt_subset_map: Dict[str, Set[str]] = {}
    needed_target_ids: Set[str] = set()
    sampled_s1_ids: List[str] = []

    for _, row in sampled_m.iterrows():
        s1 = row["source1_entity_id"]
        matches = {t.strip() for t in row["matched_entity_ids"].split(",") if t.strip()}
        gt_subset_map[s1] = matches
        needed_target_ids.update(matches)
        sampled_s1_ids.append(s1)

    for _, row in sampled_z.iterrows():
        s1 = row["source1_entity_id"]
        gt_subset_map[s1] = set()
        sampled_s1_ids.append(s1)

    return sampled_s1_ids, gt_subset_map, needed_target_ids


# ==============================================================================
# RECORD LOADERS
# ==============================================================================

def load_s1_entities_by_ids(
    s1_path: Path,
    needed_s1_ids: Set[str],
    chunk_size: int = CHUNK_SIZE
) -> Dict[str, PreprocessedEntity]:
    """Loads specific S1 records in fast chunked mode."""
    req_cols = ["entity_id", "business_name", "business_address", "country"]
    records: Dict[str, PreprocessedEntity] = {}

    for chunk in pd.read_csv(s1_path, sep="\t", usecols=req_cols, dtype=str, chunksize=chunk_size):
        sub = chunk[chunk["entity_id"].isin(needed_s1_ids)]
        for row in sub.itertuples(index=False):
            pe = PreprocessedEntity.from_raw(row.entity_id, row.business_name, row.business_address, row.country)
            records[pe.entity_id] = pe
        if len(records) >= len(needed_s1_ids):
            break

    return records


def load_target_records_pool(
    source2_path: Path,
    source3_path: Path,
    needed_target_ids: Set[str],
    random_sample_per_chunk: int = 1000,
    seed: int = RANDOM_SEED,
    chunk_size: int = CHUNK_SIZE
) -> Dict[str, PreprocessedEntity]:
    """Loads all required true target records plus random hard targets for training/validation."""
    req_cols = ["entity_id", "business_name", "business_address", "country"]
    targets: Dict[str, PreprocessedEntity] = {}

    for path, prefix in [(source2_path, "S2"), (source3_path, "S3")]:
        c_seed = seed if prefix == "S2" else seed + 100
        for i, chunk in enumerate(pd.read_csv(path, sep="\t", usecols=req_cols, dtype=str, chunksize=chunk_size)):
            # 1. Guaranteed include all needed true targets in this chunk
            sub_needed = chunk[chunk["entity_id"].isin(needed_target_ids)]
            for row in sub_needed.itertuples(index=False):
                pe = PreprocessedEntity.from_raw(row.entity_id, row.business_name, row.business_address, row.country)
                targets[pe.entity_id] = pe

            # 2. Sample random pool records
            if random_sample_per_chunk > 0:
                avail = chunk[~chunk["entity_id"].isin(needed_target_ids)]
                n_sample = min(random_sample_per_chunk, len(avail))
                if n_sample > 0:
                    sample_sub = avail.sample(n=n_sample, random_state=c_seed + i)
                    for row in sample_sub.itertuples(index=False):
                        pe = PreprocessedEntity.from_raw(row.entity_id, row.business_name, row.business_address, row.country)
                        targets[pe.entity_id] = pe

    return targets


def build_blocker_from_targets(targets: Dict[str, PreprocessedEntity]) -> MultiPassBlocker:
    """Builds and returns a MultiPassBlocker populated with the given targets."""
    blocker = MultiPassBlocker()
    for target in targets.values():
        blocker.index_target_entity(target)
    return blocker


def stream_s1_entities(
    s1_path: Path,
    chunk_size: int = CHUNK_SIZE
) -> Iterator[List[PreprocessedEntity]]:
    """Streams S1 records from TSV as lists of PreprocessedEntity."""
    req_cols = ["entity_id", "business_name", "business_address", "country"]
    for chunk in pd.read_csv(s1_path, sep="\t", usecols=req_cols, dtype=str, chunksize=chunk_size):
        entities: List[PreprocessedEntity] = []
        for row in chunk.itertuples(index=False):
            entities.append(PreprocessedEntity.from_raw(row.entity_id, row.business_name, row.business_address, row.country))
        yield entities
