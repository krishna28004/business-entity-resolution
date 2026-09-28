"""
Inference module for full test set evaluation.
Processes test_source1 in streaming chunks, generates exact candidate_pairs,
scores candidates with the trained matcher, and writes submission-ready TSVs.
"""

import time
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple, Any

import pandas as pd
from tqdm import tqdm

try:
    from .blocking import CompactDiskBlocker, MultiPassBlocker, build_compact_disk_index
    from .config import (
        CHUNK_SIZE,
        DEFAULT_PROBABILITY_THRESHOLD,
        OUTPUT_CANDIDATE_PATH,
        OUTPUT_MATCHING_PATH,
        SINGLETON_MARGIN_THRESHOLD,
        TARGET_DB_PATH,
        TEST_SOURCE1_PATH,
        TEST_SOURCE2_PATH,
        TEST_SOURCE3_PATH,
    )
    from .matcher import EntityMatcher
    from .normalization import PreprocessedEntity
    from .thresholding import apply_decision_rules
except (ImportError, ValueError):
    from blocking import CompactDiskBlocker, MultiPassBlocker, build_compact_disk_index
    from config import (
        CHUNK_SIZE,
        DEFAULT_PROBABILITY_THRESHOLD,
        OUTPUT_CANDIDATE_PATH,
        OUTPUT_MATCHING_PATH,
        SINGLETON_MARGIN_THRESHOLD,
        TARGET_DB_PATH,
        TEST_SOURCE1_PATH,
        TEST_SOURCE2_PATH,
        TEST_SOURCE3_PATH,
    )
    from matcher import EntityMatcher
    from normalization import PreprocessedEntity
    from thresholding import apply_decision_rules


def build_test_target_index(
    source2_path: Path = TEST_SOURCE2_PATH,
    source3_path: Path = TEST_SOURCE3_PATH,
    db_path: Path = TARGET_DB_PATH,
    max_targets_per_source: Optional[int] = None,
    chunk_size: int = CHUNK_SIZE
) -> Tuple[Any, Optional[Dict[str, PreprocessedEntity]]]:
    """Streams Source 2 and Source 3 test files and builds the compact disk-backed index.
    If the index database already exists on disk, reuses it immediately without rebuilding.

    Returns:
        blocker: Populated CompactDiskBlocker
        target_entities: None (target records are retrieved on-demand from disk)
    """
    db_path = Path(db_path)
    if db_path.exists() and max_targets_per_source is None:
        print(f"Reusing existing verified target index at {db_path} ({db_path.stat().st_size:,} bytes)...")
        return CompactDiskBlocker(db_path), None

    blocker = build_compact_disk_index(
        source2_path=source2_path,
        source3_path=source3_path,
        db_path=db_path,
        max_targets_per_source=max_targets_per_source,
        chunk_size=chunk_size
    )
    return blocker, None


def run_test_inference(
    matcher: EntityMatcher,
    blocker: Any,
    target_entities: Optional[Dict[str, PreprocessedEntity]] = None,
    test_s1_path: Path = TEST_SOURCE1_PATH,
    matching_output_path: Path = OUTPUT_MATCHING_PATH,
    candidate_output_path: Path = OUTPUT_CANDIDATE_PATH,
    threshold: float = DEFAULT_PROBABILITY_THRESHOLD,
    margin: float = SINGLETON_MARGIN_THRESHOLD,
    chunk_size: int = CHUNK_SIZE,
    max_s1_records: Optional[int] = None,
    candidate_cap: Optional[int] = None
) -> None:
    """Streams test_source1, performs blocking, inference, and writes both submission files.

    Guarantees:
    - Lightweight checkpoint / resume: can resume seamlessly after interruption without re-scoring.
    - Every S1 entity in test_source1 appears exactly once in both files.
    - Candidate file contains the EXACT set of candidates scored by the model.
    - All predictions are a subset of candidates.
    - Zero matches are written with empty string in matched_entity_ids.
    - Tab-separated UTF-8 formatting.
    - Periodic flush every 1,000 entities to prevent data loss on unexpected shutdown.
    """
    matching_output_path.parent.mkdir(parents=True, exist_ok=True)
    candidate_output_path.parent.mkdir(parents=True, exist_ok=True)

    req_cols = ["entity_id", "business_name", "business_address", "country"]

    # Check for existing partial outputs for lightweight resume
    resumed_ids: Set[str] = set()
    if matching_output_path.exists() and candidate_output_path.exists():
        try:
            with open(matching_output_path, "r", encoding="utf-8") as fm, \
                 open(candidate_output_path, "r", encoding="utf-8") as fc:
                m_lines = sum(1 for _ in fm)
                c_lines = sum(1 for _ in fc)
            if m_lines > 1 and m_lines == c_lines:
                df_done = pd.read_csv(matching_output_path, sep="\t", usecols=["source1_entity_id"], dtype=str)
                resumed_ids = set(df_done["source1_entity_id"].dropna())
                print(f"Resuming inference: detected {len(resumed_ids):,} completed S1 entities in existing outputs.")
            elif m_lines != c_lines:
                print(f"Warning: Output files out of sync ({m_lines} vs {c_lines} lines). Starting fresh to ensure consistency.")
        except Exception as e:
            print(f"Warning: Could not parse existing outputs ({e}). Starting fresh.")

    file_mode = "a" if resumed_ids else "w"
    total_s1_processed = len(resumed_ids)
    total_matches_predicted = 0
    flush_counter = 0

    t_start = time.perf_counter()
    TOTAL_EXPECTED_S1 = 1_732_544

    with open(matching_output_path, file_mode, encoding="utf-8", newline="\n") as f_match, \
         open(candidate_output_path, file_mode, encoding="utf-8", newline="\n") as f_cand:

        if not resumed_ids:
            # Write required official headers
            f_match.write("source1_entity_id\tmatched_entity_ids\n")
            f_cand.write("source1_entity_id\tcandidate_entity_ids\n")
            f_match.flush()
            f_cand.flush()

        for chunk in pd.read_csv(test_s1_path, sep="\t", usecols=req_cols, dtype=str, chunksize=chunk_size):
            if max_s1_records is not None and total_s1_processed >= max_s1_records:
                break
            for row in chunk.itertuples(index=False):
                if max_s1_records is not None and total_s1_processed >= max_s1_records:
                    break
                s1_id = row.entity_id
                if s1_id in resumed_ids:
                    continue

                s1 = PreprocessedEntity.from_raw(row.entity_id, row.business_name, row.business_address, row.country)

                # 1. Blocking retrieval: get candidates and hit passes
                try:
                    cand_hits = blocker.retrieve_candidates(s1, max_candidates=candidate_cap)
                except TypeError:
                    cand_hits = blocker.retrieve_candidates(s1)
                cand_map = {tid: hit.hit_passes for tid, hit in cand_hits.items()}
                cand_ids_sorted = sorted(cand_map.keys())

                # 2. Write candidate_pairs.tsv (EXACT candidates passed to model)
                f_cand.write(f"{s1_id}\t{','.join(cand_ids_sorted)}\n")

                # 3. Model scoring
                if not cand_map:
                    # No candidates generated: predict singleton empty
                    f_match.write(f"{s1_id}\t\n")
                    total_s1_processed += 1
                    flush_counter += 1
                    if flush_counter >= 1000:
                        f_match.flush()
                        f_cand.flush()
                        flush_counter = 0
                    continue

                # Fetch targets on-demand if supported by disk-backed blocker
                if hasattr(blocker, "fetch_target_entities"):
                    scored_targets = blocker.fetch_target_entities(set(cand_map.keys()))
                else:
                    scored_targets = target_entities

                scores = matcher.score_candidates_for_s1(s1, cand_map, scored_targets)

                # 4. Decision rules (thresholding + margin safety)
                predicted_matches = apply_decision_rules(scores, threshold=threshold, margin=margin)

                # Format matched IDs
                matched_str = ",".join(sorted(predicted_matches))
                f_match.write(f"{s1_id}\t{matched_str}\n")

                total_s1_processed += 1
                if predicted_matches:
                    total_matches_predicted += len(predicted_matches)

                flush_counter += 1
                if flush_counter >= 1000:
                    f_match.flush()
                    f_cand.flush()
                    flush_counter = 0

                if total_s1_processed > 0 and total_s1_processed % 5000 == 0:
                    now = time.perf_counter()
                    elapsed = now - t_start
                    processed_since_start = total_s1_processed - len(resumed_ids)
                    rate = processed_since_start / elapsed if elapsed > 0 else 0
                    rem_entities = max(0, TOTAL_EXPECTED_S1 - total_s1_processed)
                    eta_hours = (rem_entities / rate) / 3600 if rate > 0 else 0
                    pct = (total_s1_processed / TOTAL_EXPECTED_S1) * 100
                    print(f"[{elapsed/3600:.2f}h] Processed {total_s1_processed:,} / {TOTAL_EXPECTED_S1:,} ({pct:.2f}%) | "
                          f"Rate: {rate:.1f} S1/s | Matches: {total_matches_predicted:,} | ETA: {eta_hours:.2f}h", flush=True)

    print(f"Test inference complete. Processed {total_s1_processed:,} S1 entities.")
    print(f"Total predicted matches: {total_matches_predicted:,}")
    print(f"Outputs written to:\n  {matching_output_path}\n  {candidate_output_path}")
