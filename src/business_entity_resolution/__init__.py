"""
Scalable Business Entity Resolution Package.

A machine learning pipeline for matching noisy business records across heterogeneous
data sources using multilingual normalization, multi-pass blocking, candidate generation,
and gradient-boosted pair classification.
"""

__version__ = "1.0.0"

from .post_filter import apply_evidence_post_filter, is_pair_valid_match
