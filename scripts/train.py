#!/usr/bin/env python3
"""
Model training CLI script for Scalable Business Entity Resolution.
Trains a LightGBM pair-matching classifier using calibrated probability thresholds.
"""

import sys
import argparse
from pathlib import Path

# Ensure package root is in path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "src"))

from business_entity_resolution.pipeline import run_validation_experiment


def main():
    parser = argparse.ArgumentParser(
        description="Train the LightGBM Business Entity Resolution matching model."
    )
    parser.add_argument(
        "--matched",
        type=int,
        default=4000,
        help="Number of matched Source-1 reference entities (default: 4000)",
    )
    parser.add_argument(
        "--zero",
        type=int,
        default=1000,
        help="Number of zero-match Source-1 reference entities (default: 1000)",
    )
    parser.add_argument(
        "--model",
        type=str,
        default="lightgbm",
        choices=["lightgbm", "hist_gradient_boosting"],
        help="Classifier architecture (default: lightgbm)",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducibility (default: 42)",
    )

    args = parser.parse_args()

    print("=" * 70)
    print("STARTING ENTITY RESOLUTION MODEL TRAINING & VALIDATION")
    print("=" * 70)
    print(f"Matched entities: {args.matched:,}")
    print(f"Zero-match entities: {args.zero:,}")
    print(f"Model architecture: {args.model}")
    print(f"Random seed: {args.seed}")
    print("-" * 70)

    run_validation_experiment(
        n_matched=args.matched,
        n_zero=args.zero,
        seed=args.seed,
        model_type=args.model,
    )


if __name__ == "__main__":
    main()
