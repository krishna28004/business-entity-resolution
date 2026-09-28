#!/usr/bin/env python3
"""
Evaluation CLI script for Scalable Business Entity Resolution.
Evaluates pair precision, pair recall, Macro F0.5, and error analysis.
"""

import sys
import argparse
from pathlib import Path

# Ensure package root is in path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "src"))

from business_entity_resolution.evaluation import (
    compute_all_metrics,
    audit_error_categories,
    save_validation_results,
)
from business_entity_resolution.config import (
    VALIDATION_METRICS_PATH,
    ERROR_ANALYSIS_PATH,
)


def main():
    parser = argparse.ArgumentParser(
        description="Evaluate Business Entity Resolution predictions against ground truth."
    )
    parser.add_argument(
        "--metrics-output",
        type=str,
        default=str(VALIDATION_METRICS_PATH),
        help=f"Destination path for validation metrics TSV (default: {VALIDATION_METRICS_PATH})",
    )
    parser.add_argument(
        "--error-output",
        type=str,
        default=str(ERROR_ANALYSIS_PATH),
        help=f"Destination path for error audit TSV (default: {ERROR_ANALYSIS_PATH})",
    )

    args = parser.parse_args()

    print("=" * 70)
    print("EVALUATION & ERROR AUDIT MODULE")
    print("=" * 70)
    print(f"Metrics output: {args.metrics_output}")
    print(f"Error output:   {args.error_output}")
    print("Use `scripts/train.py` to run full validation experiments with error audits.")


if __name__ == "__main__":
    main()
