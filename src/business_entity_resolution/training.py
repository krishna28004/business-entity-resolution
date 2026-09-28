"""
Model training and dataset preparation module.
Builds positive and hard-negative training pairs from blocking,
enforces entity-level train/validation split (zero leakage),
and trains LightGBM (with HistGradientBoostingClassifier fallback).
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

try:
    import lightgbm as lgb
    HAS_LIGHTGBM = True
except ImportError:
    HAS_LIGHTGBM = False

from sklearn.ensemble import HistGradientBoostingClassifier

try:
    from .blocking import MultiPassBlocker
    from .config import (
        FEATURE_NAMES,
        HIST_GRADIENT_BOOSTING_PARAMS,
        LIGHTGBM_PARAMS,
        RANDOM_SEED,
        SAVED_MODEL_PATH,
    )
    from .features import extract_pairwise_feature_vector
    from .normalization import PreprocessedEntity
except (ImportError, ValueError):
    from blocking import MultiPassBlocker
    from config import (
        FEATURE_NAMES,
        HIST_GRADIENT_BOOSTING_PARAMS,
        LIGHTGBM_PARAMS,
        RANDOM_SEED,
        SAVED_MODEL_PATH,
    )
    from features import extract_pairwise_feature_vector
    from normalization import PreprocessedEntity


def generate_training_dataset(
    s1_ids: List[str],
    s1_entities: Dict[str, PreprocessedEntity],
    target_entities: Dict[str, PreprocessedEntity],
    blocker: MultiPassBlocker,
    gt_map: Dict[str, Set[str]],
    max_neg_ratio: int = 10,
    seed: int = RANDOM_SEED
) -> Tuple[np.ndarray, np.ndarray, List[Tuple[str, str]]]:
    """Generates feature matrix X, binary labels y, and pair identifiers (s1_id, target_id).

    True positives: candidates that match ground truth (y = 1).
    Hard negatives: candidates retrieved by blocking that are not in ground truth (y = 0).
    Negative subsampling is applied per S1 to prevent severe class imbalance and manage memory.
    """
    rng = np.random.RandomState(seed)
    X_rows: List[np.ndarray] = []
    y_vals: List[int] = []
    pair_ids: List[Tuple[str, str]] = []

    for s1_id in s1_ids:
        s1 = s1_entities.get(s1_id)
        if not s1:
            continue

        true_targets = gt_map.get(s1_id, set())
        candidate_hits = blocker.retrieve_candidates(s1)

        pos_pairs: List[Tuple[str, Set[str]]] = []
        neg_pairs: List[Tuple[str, Set[str]]] = []

        for tid, hit in candidate_hits.items():
            if tid not in target_entities:
                continue
            if tid in true_targets:
                pos_pairs.append((tid, hit.hit_passes))
            else:
                neg_pairs.append((tid, hit.hit_passes))

        # Subsample negatives if they exceed max_neg_ratio * max(1, len(pos_pairs))
        max_negs = max(1, len(pos_pairs)) * max_neg_ratio
        if len(neg_pairs) > max_negs:
            sampled_idx = rng.choice(len(neg_pairs), size=max_negs, replace=False)
            neg_pairs = [neg_pairs[i] for i in sampled_idx]

        # Extract features for positive pairs
        for tid, passes in pos_pairs:
            tgt = target_entities[tid]
            feat_vec = extract_pairwise_feature_vector(s1, tgt, passes)
            X_rows.append(feat_vec)
            y_vals.append(1)
            pair_ids.append((s1_id, tid))

        # Extract features for hard negative pairs
        for tid, passes in neg_pairs:
            tgt = target_entities[tid]
            feat_vec = extract_pairwise_feature_vector(s1, tgt, passes)
            X_rows.append(feat_vec)
            y_vals.append(0)
            pair_ids.append((s1_id, tid))

    if not X_rows:
        return np.empty((0, len(FEATURE_NAMES)), dtype=np.float32), np.empty(0, dtype=int), []

    X = np.vstack(X_rows).astype(np.float32)
    y = np.array(y_vals, dtype=int)
    return X, y, pair_ids


def split_s1_entities(
    s1_ids: List[str],
    gt_map: Dict[str, Set[str]],
    val_size: float = 0.20,
    seed: int = RANDOM_SEED
) -> Tuple[List[str], List[str]]:
    """Splits S1 entity IDs into train and validation sets with zero entity-level leakage.

    Stratified by whether the S1 entity has >= 1 match or is a singleton zero-match.
    """
    has_match = [1 if len(gt_map.get(sid, set())) > 0 else 0 for sid in s1_ids]
    train_ids, val_ids = train_test_split(
        s1_ids,
        test_size=val_size,
        random_state=seed,
        stratify=has_match
    )
    return train_ids, val_ids


def train_matching_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    model_type: str = "lightgbm",
    save_path: Optional[Path] = SAVED_MODEL_PATH
) -> Any:
    """Trains LightGBM or HistGradientBoostingClassifier and saves the model artifact."""
    pos_count = int(np.sum(y_train == 1))
    neg_count = int(np.sum(y_train == 0))
    scale_pos = (neg_count / max(1, pos_count))

    if model_type == "lightgbm" and HAS_LIGHTGBM:
        params = LIGHTGBM_PARAMS.copy()
        # Moderate positive weight to balance precision without missing matches
        params["scale_pos_weight"] = min(scale_pos, 5.0)
        model = lgb.LGBMClassifier(**params)
    else:
        params = HIST_GRADIENT_BOOSTING_PARAMS.copy()
        model = HistGradientBoostingClassifier(**params)

    model.fit(X_train, y_train)

    if save_path:
        save_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({"model": model, "feature_names": FEATURE_NAMES, "model_type": model_type}, save_path)

    return model
