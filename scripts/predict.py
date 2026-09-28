#!/usr/bin/env python3
"""
Prediction & Inference CLI script for Scalable Business Entity Resolution.
Runs candidate generation, pairwise feature extraction, LightGBM inference,
and deterministic evidence post-filtering.
"""

import sys
import argparse
from pathlib import Path

# Ensure package root is in path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "src"))

from business_entity_resolution.matcher import EntityMatcher
from business_entity_resolution.data_loader import build_test_target_index
from business_entity_resolution.inference import run_test_inference
from business_entity_resolution.post_filter import apply_evidence_post_filter
from business_entity_resolution.config import (
    DEFAULT_PROBABILITY_THRESHOLD,
    SINGLETON_MARGIN_THRESHOLD,
    DEFAULT_CANDIDATE_CAP,
    TEST_SOURCE1_PATH,
    TARGET_DB_PATH,
    OUTPUT_MATCHING_PATH,
)


def main():
    parser = argparse.ArgumentParser(
        description="Run end-to-end inference for Business Entity Resolution."
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=DEFAULT_PROBABILITY_THRESHOLD,
        help=f"Classifier decision probability cutoff (default: {DEFAULT_PROBABILITY_THRESHOLD})",
    )
    parser.add_argument(
        "--margin",
        type=float,
        default=SINGLETON_MARGIN_THRESHOLD,
        help=f"Relative margin threshold (default: {SINGLETON_MARGIN_THRESHOLD})",
    )
    parser.add_argument(
        "--cap",
        type=int,
        default=DEFAULT_CANDIDATE_CAP,
        help=f"Maximum candidate pool per entity (default: {DEFAULT_CANDIDATE_CAP})",
    )
    parser.add_argument(
        "--apply-post-filter",
        action="store_true",
        default=True,
        help="Apply deterministic evidence post-filter for precision control (default: True)",
    )

    args = parser.parse_args()

    print("=" * 70)
    print("STARTING TEST SET STREAMING INFERENCE PIPELINE")
    print("=" * 70)
    print(f"Decision threshold: {args.threshold}")
    print(f"Margin threshold:   {args.margin}")
    print(f"Candidate cap:      {args.cap}")
    print(f"Post-filter active: {args.apply_post_filter}")
    print("-" * 70)

    matcher = EntityMatcher()
    blocker, targets = build_test_target_index()

    run_test_inference(
        matcher,
        blocker,
        targets,
        threshold=args.threshold,
        margin=args.margin,
        candidate_cap=args.cap,
    )

    if args.apply_post_filter and TARGET_DB_PATH.exists():
        print("\nApplying deterministic evidence post-filter...")
        temp_raw_path = OUTPUT_MATCHING_PATH.with_suffix(".raw.tsv")
        if OUTPUT_MATCHING_PATH.exists():
            OUTPUT_MATCHING_PATH.rename(temp_raw_path)
            apply_evidence_post_filter(
                input_matching_path=temp_raw_path,
                test_s1_path=TEST_SOURCE1_PATH,
                target_db_path=TARGET_DB_PATH,
                output_matching_path=OUTPUT_MATCHING_PATH,
            )
            print(f"Final filtered results written to: {OUTPUT_MATCHING_PATH}")


if __name__ == "__main__":
    main()
