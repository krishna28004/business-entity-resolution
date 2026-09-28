"""
Threshold calibration and decision rule module.
Optimizes decision thresholds specifically for Macro F0.5
and implements conservative singleton/multi-match safeguards.
"""

from typing import Dict, List, Set, Tuple

import numpy as np
import pandas as pd

try:
    from .config import CALIBRATION_THRESHOLDS, DEFAULT_PROBABILITY_THRESHOLD
    from .evaluation import compute_entity_f05
except (ImportError, ValueError):
    from config import CALIBRATION_THRESHOLDS, DEFAULT_PROBABILITY_THRESHOLD
    from evaluation import compute_entity_f05


def calibrate_threshold(
    gt_map: Dict[str, Set[str]],
    candidates_scores: Dict[str, Dict[str, float]],
    candidate_passes: Dict[str, Dict[str, Set[str]]],
    thresholds: List[float] = CALIBRATION_THRESHOLDS
) -> Tuple[float, pd.DataFrame]:
    """Finds the optimal decision threshold that maximizes Macro F0.5 on validation data.

    Returns:
        best_threshold: the threshold achieving maximum Macro F0.5
        calibration_df: summary table across all evaluated thresholds
    """
    s1_ids = list(gt_map.keys())
    records = []

    best_threshold = DEFAULT_PROBABILITY_THRESHOLD
    best_macro_f05 = -1.0

    for thresh in thresholds:
        total_tp = 0
        total_fp = 0
        total_fn = 0
        entity_f05_list: List[float] = []
        singleton_false_merges = 0
        singleton_total = 0

        for s1 in s1_ids:
            true_ids = gt_map.get(s1, set())
            scores = candidates_scores.get(s1, {})

            # Select candidates whose probability >= thresh
            pred_ids = {tid for tid, p in scores.items() if p >= thresh}

            # Update counts
            tp = len(true_ids & pred_ids)
            fp = len(pred_ids - true_ids)
            fn = len(true_ids - pred_ids)

            total_tp += tp
            total_fp += fp
            total_fn += fn

            _, _, ef = compute_entity_f05(true_ids, pred_ids, beta=0.5)
            entity_f05_list.append(ef)

            if len(true_ids) == 0:
                singleton_total += 1
                if len(pred_ids) > 0:
                    singleton_false_merges += 1

        macro_f05 = float(np.mean(entity_f05_list)) if entity_f05_list else 0.0
        pair_prec = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 0.0
        pair_rec = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 0.0

        records.append({
            "threshold": thresh,
            "macro_F0.5": round(macro_f05, 5),
            "pair_precision": round(pair_prec, 5),
            "pair_recall": round(pair_rec, 5),
            "false_positives": total_fp,
            "false_negatives": total_fn,
            "singleton_false_merges": singleton_false_merges,
            "singleton_accuracy": round(1.0 - (singleton_false_merges / max(1, singleton_total)), 5)
        })

        if macro_f05 > best_macro_f05:
            best_macro_f05 = macro_f05
            best_threshold = thresh

    calibration_df = pd.DataFrame(records)
    return best_threshold, calibration_df


def apply_decision_rules(
    candidates_scores: Dict[str, float],
    threshold: float,
    margin: float = 0.15
) -> Set[str]:
    """Applies precision-heavy decision rules for an S1 entity.

    Rules:
    1. Filter candidates to those with probability >= threshold.
    2. If no candidate exceeds threshold, return empty set (singleton).
    3. If multiple candidates exceed threshold:
       - Keep all that are within `margin` of the top candidate.
       - Reject distant lower candidates to avoid false merges.
    """
    if not candidates_scores:
        return set()

    # Filter by threshold
    qualified = [(tid, score) for tid, score in candidates_scores.items() if score >= threshold]
    if not qualified:
        return set()

    # Sort descending by score
    qualified.sort(key=lambda x: x[1], reverse=True)
    top_score = qualified[0][1]

    # Keep candidates that are within margin of the best score
    final_matches = set()
    for tid, score in qualified:
        if (top_score - score) <= margin:
            final_matches.add(tid)

    return final_matches
