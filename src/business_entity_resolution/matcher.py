"""
Pairwise scoring and inference matcher module.
Computes calibrated match probabilities P(match | s1, target)
using the trained classification model.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import joblib
import numpy as np

try:
    from .config import FEATURE_NAMES, SAVED_MODEL_PATH
    from .features import extract_pairwise_feature_vector
    from .normalization import PreprocessedEntity
except (ImportError, ValueError):
    from config import FEATURE_NAMES, SAVED_MODEL_PATH
    from features import extract_pairwise_feature_vector
    from normalization import PreprocessedEntity


class EntityMatcher:
    """Wrapper around trained model for efficient pairwise probability scoring."""

    def __init__(self, model_path: Path = SAVED_MODEL_PATH, model: Optional[Any] = None):
        if model is not None:
            self.model = model
            self.feature_names = FEATURE_NAMES
        else:
            if not model_path.exists():
                raise FileNotFoundError(f"Trained model artifact not found at {model_path}")
            artifact = joblib.load(model_path)
            self.model = artifact["model"]
            self.feature_names = artifact.get("feature_names", FEATURE_NAMES)

    def score_candidates_for_s1(
        self,
        s1: PreprocessedEntity,
        candidates: Dict[str, Set[str]],
        target_entities: Dict[str, PreprocessedEntity]
    ) -> Dict[str, float]:
        """Scores all candidate targets for a single S1 entity.

        Args:
            s1: Preprocessed S1 reference entity
            candidates: Dict mapping target_id -> set of blocking pass names
            target_entities: Dict mapping target_id -> PreprocessedEntity

        Returns:
            Dict mapping target_id -> match probability P(match | s1, target)
        """
        if not candidates:
            return {}

        target_ids: List[str] = []
        vectors: List[np.ndarray] = []

        for tid, passes in candidates.items():
            tgt = target_entities.get(tid)
            if not tgt:
                continue
            vec = extract_pairwise_feature_vector(s1, tgt, passes)
            vectors.append(vec)
            target_ids.append(tid)

        if not vectors:
            return {}

        X = np.vstack(vectors).astype(np.float32)
        # Predict probability of class 1 (match)
        probs = self.model.predict_proba(X)[:, 1]

        return {tid: float(p) for tid, p in zip(target_ids, probs)}

    def score_pairs_batch(
        self,
        pairs: List[Tuple[PreprocessedEntity, PreprocessedEntity, Set[str]]]
    ) -> np.ndarray:
        """Scores a batch of (s1, target, hit_passes) pairs."""
        if not pairs:
            return np.empty(0, dtype=np.float32)

        vectors = [extract_pairwise_feature_vector(s1, tgt, passes) for s1, tgt, passes in pairs]
        X = np.vstack(vectors).astype(np.float32)
        return self.model.predict_proba(X)[:, 1]
