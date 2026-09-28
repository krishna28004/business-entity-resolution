"""
Evaluation module for Business Entity Resolution.
Computes pair-level and entity-level Macro F0.5 metrics, candidate statistics,
and generates validation_metrics.tsv and error_analysis.tsv.
"""

from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

import numpy as np
import pandas as pd

try:
    from .normalization import PreprocessedEntity
except (ImportError, ValueError):
    from normalization import PreprocessedEntity


def compute_entity_f05(
    true_ids: Set[str],
    pred_ids: Set[str],
    beta: float = 0.5
) -> Tuple[float, float, float]:
    """Computes precision, recall, and F_beta for a single S1 entity.

    Handles zero-match (singleton) edge cases:
    - true empty, pred empty: P=1.0, R=1.0, F=1.0
    - true empty, pred non-empty: P=0.0, R=0.0, F=0.0
    - true non-empty, pred empty: P=0.0, R=0.0, F=0.0
    """
    if len(true_ids) == 0 and len(pred_ids) == 0:
        return 1.0, 1.0, 1.0
    if len(true_ids) == 0 or len(pred_ids) == 0:
        return 0.0, 0.0, 0.0

    inter = len(true_ids & pred_ids)
    prec = inter / len(pred_ids)
    rec = inter / len(true_ids)

    if prec == 0.0 or rec == 0.0:
        return prec, rec, 0.0

    b2 = beta ** 2
    f_beta = (1 + b2) * (prec * rec) / (b2 * prec + rec)
    return prec, rec, f_beta


def evaluate_predictions(
    gt_map: Dict[str, Set[str]],
    candidates_map: Dict[str, Set[str]],
    predictions_map: Dict[str, Set[str]],
    s1_entities: Optional[Dict[str, PreprocessedEntity]] = None,
    target_entities: Optional[Dict[str, PreprocessedEntity]] = None,
    candidate_scores: Optional[Dict[str, Dict[str, float]]] = None
) -> Tuple[Dict[str, float], pd.DataFrame]:
    """Computes comprehensive evaluation metrics and builds error analysis DataFrame.

    Returns:
        metrics_dict: summary dictionary of all required metrics
        error_df: DataFrame of error analysis cases
    """
    s1_ids = list(gt_map.keys())
    total_s1 = len(s1_ids)

    # 1. Candidate blocking statistics
    cand_counts = [len(candidates_map.get(s1, set())) for s1 in s1_ids]
    avg_cands = float(np.mean(cand_counts)) if cand_counts else 0.0
    med_cands = float(np.median(cand_counts)) if cand_counts else 0.0
    p95_cands = float(np.percentile(cand_counts, 95)) if cand_counts else 0.0

    total_gt_pairs = sum(len(ids) for ids in gt_map.values())
    retrieved_gt_pairs = 0
    for s1, true_m in gt_map.items():
        cands = candidates_map.get(s1, set())
        retrieved_gt_pairs += len(true_m & cands)

    candidate_recall = (retrieved_gt_pairs / total_gt_pairs) if total_gt_pairs > 0 else 1.0

    # 2. Pair-level metrics
    total_tp = 0
    total_fp = 0
    total_fn = 0

    # 3. Entity-level metrics
    entity_precisions: List[float] = []
    entity_recalls: List[float] = []
    entity_f05s: List[float] = []

    singleton_total = 0
    singleton_correct = 0

    error_records: List[Dict] = []

    for s1 in s1_ids:
        true_m = gt_map.get(s1, set())
        pred_m = predictions_map.get(s1, set())

        # Pair counting
        tp = len(true_m & pred_m)
        fp = len(pred_m - true_m)
        fn = len(true_m - pred_m)

        total_tp += tp
        total_fp += fp
        total_fn += fn

        # Entity metric
        ep, er, ef = compute_entity_f05(true_m, pred_m, beta=0.5)
        entity_precisions.append(ep)
        entity_recalls.append(er)
        entity_f05s.append(ef)

        # Singleton check
        if len(true_m) == 0:
            singleton_total += 1
            if len(pred_m) == 0:
                singleton_correct += 1

        # Error cases logging
        s1_rec = s1_entities.get(s1) if s1_entities else None

        # False positives (wrong merges)
        for false_tgt in (pred_m - true_m):
            tgt_rec = target_entities.get(false_tgt) if target_entities else None
            score = candidate_scores.get(s1, {}).get(false_tgt, 0.0) if candidate_scores else 0.0
            error_records.append({
                "error_type": "false_positive",
                "source1_entity_id": s1,
                "target_entity_id": false_tgt,
                "predicted_score": round(score, 4),
                "s1_name": s1_rec.norm_name if s1_rec else "",
                "s1_addr": s1_rec.norm_addr if s1_rec else "",
                "target_name": tgt_rec.norm_name if tgt_rec else "",
                "target_addr": tgt_rec.norm_addr if tgt_rec else "",
                "s1_country": s1_rec.country if s1_rec else "",
                "target_country": tgt_rec.country if tgt_rec else "",
                "note": "singleton false positive" if len(true_m) == 0 else "wrong candidate match"
            })

        # False negatives (missed matches)
        for missed_tgt in (true_m - pred_m):
            tgt_rec = target_entities.get(missed_tgt) if target_entities else None
            in_blocking = missed_tgt in candidates_map.get(s1, set())
            score = candidate_scores.get(s1, {}).get(missed_tgt, 0.0) if candidate_scores else 0.0
            error_records.append({
                "error_type": "false_negative",
                "source1_entity_id": s1,
                "target_entity_id": missed_tgt,
                "predicted_score": round(score, 4),
                "s1_name": s1_rec.norm_name if s1_rec else "",
                "s1_addr": s1_rec.norm_addr if s1_rec else "",
                "target_name": tgt_rec.norm_name if tgt_rec else "",
                "target_addr": tgt_rec.norm_addr if tgt_rec else "",
                "s1_country": s1_rec.country if s1_rec else "",
                "target_country": tgt_rec.country if tgt_rec else "",
                "note": "missed in classification (below threshold)" if in_blocking else "missed in blocking"
            })

    pair_prec = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 0.0
    pair_rec = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 0.0
    b2 = 0.25
    pair_f05 = (1 + b2) * (pair_prec * pair_rec) / (b2 * pair_prec + pair_rec) if (pair_prec + pair_rec) > 0 else 0.0

    macro_f05 = float(np.mean(entity_f05s)) if entity_f05s else 0.0
    singleton_acc = (singleton_correct / singleton_total) if singleton_total > 0 else 1.0

    metrics_dict: Dict[str, float] = {
        "candidate_recall": candidate_recall,
        "avg_candidates": avg_cands,
        "median_candidates": med_cands,
        "P95_candidates": p95_cands,
        "pair_precision": pair_prec,
        "pair_recall": pair_rec,
        "pair_F0.5": pair_f05,
        "macro_F0.5": macro_f05,
        "singleton_accuracy": singleton_acc,
        "false_positive_count": float(total_fp),
        "false_negative_count": float(total_fn),
        "true_positive_count": float(total_tp)
    }

    error_df = pd.DataFrame(error_records)
    return metrics_dict, error_df


def save_validation_results(
    metrics_dict: Dict[str, float],
    error_df: pd.DataFrame,
    metrics_path: Path,
    error_path: Path
) -> None:
    """Saves validation metrics and error analysis files."""
    metrics_path.parent.mkdir(parents=True, exist_ok=True)
    error_path.parent.mkdir(parents=True, exist_ok=True)

    # Format metrics TSV
    metrics_rows = [{"metric": k, "value": f"{v:.6f}" if isinstance(v, float) else str(v)} for k, v in metrics_dict.items()]
    df_metrics = pd.DataFrame(metrics_rows)
    df_metrics.to_csv(metrics_path, sep="\t", index=False)

    # Save error analysis TSV (limit to top 500 representative cases to save disk space)
    sample_errors = error_df.head(500) if len(error_df) > 500 else error_df
    sample_errors.to_csv(error_path, sep="\t", index=False)
