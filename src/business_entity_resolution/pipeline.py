"""
Main pipeline orchestrator for Business Entity Resolution.
Provides CLI subcommands:
  - validate: Runs Phase 16 validation experiment on held-out train split.
  - train: Trains the matching model and saves artifact.
  - predict: Runs test inference producing submission TSVs.
  - check: Validates generated submission files using official validator.
"""

import argparse
import sys
from pathlib import Path
from typing import Dict, List, Set

import numpy as np
import pandas as pd

# Bootstrap search path so pipeline can run both directly and as a package
SRC_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SRC_DIR.parent.parent

for p in [str(SRC_DIR), str(SRC_DIR.parent), str(PROJECT_ROOT)]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from .blocking import MultiPassBlocker
    from .config import (
        ERROR_ANALYSIS_PATH,
        OUTPUT_CANDIDATE_PATH,
        OUTPUT_MATCHING_PATH,
        RANDOM_SEED,
        SAVED_MODEL_PATH,
        TEST_DIR,
        TEST_SOURCE1_PATH,
        TEST_SOURCE2_PATH,
        TEST_SOURCE3_PATH,
        TRAIN_GROUND_TRUTH_PATH,
        TRAIN_SOURCE1_PATH,
        TRAIN_SOURCE2_PATH,
        TRAIN_SOURCE3_PATH,
        VALIDATION_METRICS_PATH,
        VALIDATOR_SCRIPT_PATH,
    )
    from .data_loader import (
        build_blocker_from_targets,
        load_ground_truth_map,
        load_s1_entities_by_ids,
        load_target_records_pool,
        sample_representative_s1,
    )
    from .evaluation import evaluate_predictions, save_validation_results
    from .inference import build_test_target_index, run_test_inference
    from .matcher import EntityMatcher
    from .normalization import PreprocessedEntity
    from .thresholding import apply_decision_rules, calibrate_threshold
    from .training import (
        generate_training_dataset,
        split_s1_entities,
        train_matching_model,
    )
except (ImportError, ValueError):
    from blocking import MultiPassBlocker
    from config import (
        ERROR_ANALYSIS_PATH,
        OUTPUT_CANDIDATE_PATH,
        OUTPUT_MATCHING_PATH,
        RANDOM_SEED,
        SAVED_MODEL_PATH,
        TEST_DIR,
        TEST_SOURCE1_PATH,
        TEST_SOURCE2_PATH,
        TEST_SOURCE3_PATH,
        TRAIN_GROUND_TRUTH_PATH,
        TRAIN_SOURCE1_PATH,
        TRAIN_SOURCE2_PATH,
        TRAIN_SOURCE3_PATH,
        VALIDATION_METRICS_PATH,
        VALIDATOR_SCRIPT_PATH,
    )
    from data_loader import (
        build_blocker_from_targets,
        load_ground_truth_map,
        load_s1_entities_by_ids,
        load_target_records_pool,
        sample_representative_s1,
    )
    from evaluation import evaluate_predictions, save_validation_results
    from inference import build_test_target_index, run_test_inference
    from matcher import EntityMatcher
    from normalization import PreprocessedEntity
    from thresholding import apply_decision_rules, calibrate_threshold
    from training import (
        generate_training_dataset,
        split_s1_entities,
        train_matching_model,
    )


def run_validation_experiment(
    n_matched: int = 4000,
    n_zero: int = 1000,
    seed: int = RANDOM_SEED,
    model_type: str = "lightgbm"
) -> None:
    """Executes the Phase 16 held-out validation experiment."""
    print("=" * 70)
    print("PHASE 16: HELD-OUT TRAIN VALIDATION EXPERIMENT")
    print(f"Sample: {n_matched:,} matched + {n_zero:,} zero-match S1 entities (seed={seed})")
    print(f"Model: {model_type}")
    print("=" * 70)

    # 1. Sample representative S1 and ground truth
    print("\n[Step 1/6] Sampling representative S1 entities and ground truth...")
    sampled_s1_ids, gt_map, needed_targets = sample_representative_s1(
        TRAIN_GROUND_TRUTH_PATH, n_matched=n_matched, n_zero=n_zero, seed=seed
    )
    print(f"  Total S1 entities: {len(sampled_s1_ids):,}")
    print(f"  True target IDs needed: {len(needed_targets):,}")

    # 2. Load preprocessed S1 records and target pool
    print("\n[Step 2/6] Loading preprocessed S1 and target records...")
    s1_entities = load_s1_entities_by_ids(TRAIN_SOURCE1_PATH, set(sampled_s1_ids))
    print(f"  Loaded {len(s1_entities):,} S1 entities.")

    target_entities = load_target_records_pool(
        TRAIN_SOURCE2_PATH, TRAIN_SOURCE3_PATH, needed_targets,
        random_sample_per_chunk=1000, seed=seed
    )
    print(f"  Loaded {len(target_entities):,} target records (true matches + representative hard pool).")

    # 3. Build multi-pass blocker
    print("\n[Step 3/6] Indexing targets and building MultiPassBlocker...")
    blocker = build_blocker_from_targets(target_entities)

    # 4. Split S1 entities into Train (80%) and Validation (20%)
    print("\n[Step 4/6] Creating entity-level Train / Validation split...")
    train_s1_ids, val_s1_ids = split_s1_entities(sampled_s1_ids, gt_map, val_size=0.20, seed=seed)
    print(f"  Train S1 entities: {len(train_s1_ids):,}")
    print(f"  Validation S1 entities: {len(val_s1_ids):,}")

    # 5. Generate training dataset & train model
    print("\n[Step 5/6] Generating pairwise training dataset and fitting model...")
    X_train, y_train, _ = generate_training_dataset(
        train_s1_ids, s1_entities, target_entities, blocker, gt_map, seed=seed
    )
    print(f"  X_train shape: {X_train.shape}, Positive: {int(np.sum(y_train == 1)):,}, Negative: {int(np.sum(y_train == 0)):,}")

    model = train_matching_model(X_train, y_train, model_type=model_type, save_path=SAVED_MODEL_PATH)
    print("  Model training complete. Model saved to:", SAVED_MODEL_PATH)

    # 6. Validation scoring & threshold calibration
    print("\n[Step 6/6] Scoring validation candidates and calibrating threshold...")
    matcher = EntityMatcher(model=model)

    val_candidates_map: Dict[str, Set[str]] = {}
    val_candidate_scores: Dict[str, Dict[str, float]] = {}
    val_candidate_passes: Dict[str, Dict[str, Set[str]]] = {}

    for s1_id in val_s1_ids:
        s1 = s1_entities[s1_id]
        cand_hits = blocker.retrieve_candidates(s1)
        cands_dict = {tid: hit.hit_passes for tid, hit in cand_hits.items()}
        val_candidates_map[s1_id] = set(cands_dict.keys())
        val_candidate_passes[s1_id] = cands_dict

        scores = matcher.score_candidates_for_s1(s1, cands_dict, target_entities)
        val_candidate_scores[s1_id] = scores

    val_gt = {sid: gt_map[sid] for sid in val_s1_ids}
    best_thresh, calib_df = calibrate_threshold(val_gt, val_candidate_scores, val_candidate_passes)

    print("\nCalibration Summary:")
    print(calib_df.to_string(index=False))
    print(f"\nOptimal Decision Threshold for Macro F0.5: {best_thresh:.2f}")

    # Apply decision rules at best threshold
    val_predictions: Dict[str, Set[str]] = {}
    for s1_id in val_s1_ids:
        scores = val_candidate_scores[s1_id]
        val_predictions[s1_id] = apply_decision_rules(scores, threshold=best_thresh)

    # Compute comprehensive evaluation metrics
    metrics, error_df = evaluate_predictions(
        val_gt, val_candidates_map, val_predictions,
        s1_entities=s1_entities, target_entities=target_entities,
        candidate_scores=val_candidate_scores
    )

    save_validation_results(metrics, error_df, VALIDATION_METRICS_PATH, ERROR_ANALYSIS_PATH)

    print("\n" + "=" * 70)
    print("FINAL VALIDATION RESULTS")
    print("=" * 70)
    for k, v in metrics.items():
        if isinstance(v, float):
            print(f"  {k:25s}: {v:.5f}")
        else:
            print(f"  {k:25s}: {v}")
    print("=" * 70)
    print(f"Validation metrics saved to: {VALIDATION_METRICS_PATH}")
    print(f"Error analysis saved to:     {ERROR_ANALYSIS_PATH}")


def main():
    parser = argparse.ArgumentParser(description="Business Entity Resolution Production Pipeline")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # validate subcommand
    p_val = subparsers.add_parser("validate", help="Run held-out train validation experiment")
    p_val.add_argument("--matched", type=int, default=4000, help="Number of matched S1 entities (default: 4000)")
    p_val.add_argument("--zero", type=int, default=1000, help="Number of zero-match S1 entities (default: 1000)")
    p_val.add_argument("--model", type=str, default="lightgbm", choices=["lightgbm", "hist_gradient_boosting"], help="Model type")
    p_val.add_argument("--seed", type=int, default=RANDOM_SEED, help="Random seed (default: 42)")

    # predict subcommand
    p_pred = subparsers.add_parser("predict", help="Run full test set inference")
    p_pred.add_argument("--threshold", type=float, default=DEFAULT_PROBABILITY_THRESHOLD, help=f"Decision probability threshold (default: {DEFAULT_PROBABILITY_THRESHOLD})")
    p_pred.add_argument("--margin", type=float, default=SINGLETON_MARGIN_THRESHOLD, help=f"Multi-match margin threshold (default: {SINGLETON_MARGIN_THRESHOLD})")

    args = parser.parse_args()

    if args.command == "validate":
        run_validation_experiment(
            n_matched=args.matched,
            n_zero=args.zero,
            seed=args.seed,
            model_type=args.model
        )
    elif args.command == "predict":
        print(f"Starting test inference with threshold={args.threshold}, margin={args.margin}...")
        matcher = EntityMatcher()
        blocker, targets = build_test_target_index()
        run_test_inference(
            matcher, blocker, targets,
            threshold=args.threshold,
            margin=args.margin
        )


if __name__ == "__main__":
    main()
