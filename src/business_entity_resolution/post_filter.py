"""
Production Evidence-Based Post-Filter for Business Entity Resolution.
Stage 7 of the entity resolution pipeline.

Deterministic precision-control stage applying rules derived from train ground truth:
1. Strict building-number mismatch guard.
2. France commune/city collision protection.
3. Minimum substantive evidence guard.
4. Relative evidence margin pruning (top score - 0.12).
5. Ground-truth aligned zero-match fallback behavior.
"""

import sys
import os
import time
import sqlite3
from pathlib import Path
from collections import defaultdict
from rapidfuzz import fuzz

from .normalization import (
    normalize_text,
    get_legal_suffix_stripped,
    extract_address_features,
    extract_char_ngrams
)


class FastEntity:
    __slots__ = ('norm_name', 'stripped_name', 'norm_addr', 'name_3g', 'addr_3g', 'num_tokens', 'country')
    def __init__(self, norm_n, stripped_n, norm_a, n3, a3, nums, c):
        self.norm_name = norm_n
        self.stripped_name = stripped_n
        self.norm_addr = norm_a
        self.name_3g = n3
        self.addr_3g = a3
        self.num_tokens = nums
        self.country = c


def preprocess_raw(name: str, addr: str, country: str) -> FastEntity:
    norm_n = normalize_text(name)
    norm_a = normalize_text(addr)
    stripped_n = get_legal_suffix_stripped(norm_n)
    num_a, _, _ = extract_address_features(norm_a)
    n3 = extract_char_ngrams(norm_n, 3)
    a3 = extract_char_ngrams(norm_a, 3)
    return FastEntity(norm_n, stripped_n, norm_a, n3, a3, set(num_a), str(country).strip())


def is_pair_valid_match(s1: FastEntity, tgt: FastEntity):
    """
    Deterministic pairwise evidence evaluator.
    Returns (is_valid: bool, comb_score: float).
    """
    n_sort = fuzz.token_sort_ratio(s1.norm_name, tgt.norm_name) / 100.0
    n_strip = fuzz.token_sort_ratio(s1.stripped_name, tgt.stripped_name) / 100.0
    n_ratio = fuzz.ratio(s1.norm_name, tgt.norm_name) / 100.0
    n_set = fuzz.token_set_ratio(s1.norm_name, tgt.norm_name) / 100.0

    s1_n3 = s1.name_3g
    tgt_n3 = tgt.name_3g
    n_3g = len(s1_n3 & tgt_n3) / max(1, len(s1_n3 | tgt_n3)) if (s1_n3 or tgt_n3) else 0.0

    name_score = max(n_sort, n_strip, 0.85 * n_set, n_ratio)

    a_sort = fuzz.token_sort_ratio(s1.norm_addr, tgt.norm_addr) / 100.0
    a_set = fuzz.token_set_ratio(s1.norm_addr, tgt.norm_addr) / 100.0
    a_ratio = fuzz.ratio(s1.norm_addr, tgt.norm_addr) / 100.0

    s1_a3 = s1.addr_3g
    tgt_a3 = tgt.addr_3g
    a_3g = len(s1_a3 & tgt_a3) / max(1, len(s1_a3 | tgt_a3)) if (s1_a3 or tgt_a3) else 0.0

    addr_score = max(a_sort, 0.85 * a_set, a_ratio)

    s1_nums = s1.num_tokens
    tgt_nums = tgt.num_tokens
    if s1_nums and tgt_nums:
        num_match = bool(s1_nums & tgt_nums)
        num_mismatch = not num_match
    else:
        num_match = False
        num_mismatch = False

    is_multilingual = any(ord(ch) > 127 for ch in s1.norm_name) or any(ord(ch) > 127 for ch in tgt.norm_name)

    # 1. Building number mismatch guard:
    # Reject number mismatch unless name is near-exact and address is very high
    if num_mismatch:
        if n_sort < 0.88 or addr_score < 0.75:
            return False, 0.0

    # 2. France commune-only collision guard:
    # Reject candidates where match is driven solely by city/commune name
    if s1.country.lower() == "france":
        if n_sort < 0.82 and a_sort < 0.70:
            return False, 0.0

    # 3. Minimum substantive evidence guard
    if name_score < 0.65 and addr_score < 0.60 and not is_multilingual:
        return False, 0.0

    # Combined score
    comb = 0.55 * name_score + 0.35 * addr_score
    if num_match: comb += 0.10
    elif num_mismatch: comb -= 0.10

    # Positive match criteria
    is_valid = False
    if name_score >= 0.75 and addr_score >= 0.55 and not num_mismatch:
        is_valid = True
    elif name_score >= 0.85 and num_match and (addr_score >= 0.35 or a_3g >= 0.30):
        is_valid = True
    elif name_score >= 0.92 and not num_mismatch and (addr_score >= 0.40 or a_3g >= 0.30 or not tgt.norm_addr):
        is_valid = True
    elif addr_score >= 0.85 and num_match and name_score >= 0.68:
        is_valid = True
    elif is_multilingual and addr_score >= 0.60 and not num_mismatch and (n_3g >= 0.25 or name_score >= 0.58):
        is_valid = True

    return is_valid, comb


def apply_evidence_post_filter(
    input_matching_path: Path,
    test_s1_path: Path,
    target_db_path: Path,
    output_matching_path: Path,
    batch_size: int = 25_000
):
    """
    Applies the full-scale evidence post-filter to intermediate matching results.
    """
    output_matching_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(target_db_path)
    cur = conn.cursor()
    cur.execute("CREATE TEMP TABLE batch_needed_ids (eid TEXT PRIMARY KEY)")

    with open(test_s1_path, "r", encoding="utf-8") as f_s1, \
         open(input_matching_path, "r", encoding="utf-8") as f_m, \
         open(output_matching_path, "w", encoding="utf-8", newline="\n") as f_out:

        h_s1 = f_s1.readline()
        h_m = f_m.readline()
        f_out.write(h_m)

        batch_s1 = []
        batch_m = []

        while True:
            batch_s1.clear()
            batch_m.clear()

            for _ in range(batch_size):
                line_s1 = f_s1.readline()
                if not line_s1:
                    break
                line_m = f_m.readline()
                batch_s1.append(line_s1)
                batch_m.append(line_m)

            if not batch_s1:
                break

            needed_tids = set()
            parsed_batch = []

            for l_s1, l_m in zip(batch_s1, batch_m):
                p_s1 = l_s1.rstrip("\r\n").split("\t")
                p_m = l_m.rstrip("\r\n").split("\t")
                eid = p_s1[0]
                name = p_s1[1] if len(p_s1) > 1 else ""
                addr = p_s1[2] if len(p_s1) > 2 else ""
                country = p_s1[3] if len(p_s1) > 3 else ""
                matches = [m.strip() for m in p_m[1].split(",") if m.strip()] if (len(p_m) > 1 and p_m[1]) else []

                parsed_batch.append((eid, name, addr, country, matches))
                needed_tids.update(matches)

            targets_dict = {}
            if needed_tids:
                cur.execute("DELETE FROM batch_needed_ids")
                cur.executemany("INSERT OR IGNORE INTO batch_needed_ids VALUES (?)", [(tid,) for tid in needed_tids])
                cur.execute("SELECT t.entity_id, t.name, t.addr, t.country FROM batch_needed_ids b JOIN target_records t ON b.eid = t.entity_id")
                for r in cur.fetchall():
                    targets_dict[r[0]] = preprocess_raw(r[1], r[2], r[3])

            for eid, name, addr, country, matches in parsed_batch:
                if not matches:
                    f_out.write(f"{eid}\t\n")
                    continue

                s1 = preprocess_raw(name, addr, country)
                scored = []
                all_cands_scores = []

                for tid in matches:
                    tgt = targets_dict.get(tid)
                    if tgt:
                        valid, comb = is_pair_valid_match(s1, tgt)
                        all_cands_scores.append((tid, comb, tgt))
                        if valid:
                            scored.append((tid, comb))

                if scored:
                    scored.sort(key=lambda x: x[1], reverse=True)
                    top_c = scored[0][1]
                    retained = [tid for tid, score in scored if (top_c - score <= 0.12)]
                else:
                    if all_cands_scores:
                        all_cands_scores.sort(key=lambda x: x[1], reverse=True)
                        b_tid, b_comb, b_tgt = all_cands_scores[0]
                        n_sort = fuzz.token_sort_ratio(s1.norm_name, b_tgt.norm_name) / 100.0
                        if b_comb >= 0.50 or n_sort >= 0.72:
                            retained = [b_tid]
                        else:
                            retained = []
                    else:
                        retained = []

                f_out.write(f"{eid}\t{','.join(retained)}\n")

    conn.close()
