"""
Unit tests for 33-dimensional pairwise feature extraction.
"""

import pytest
import numpy as np
from business_entity_resolution.normalization import PreprocessedEntity
from business_entity_resolution.features import (
    extract_pairwise_feature_dict,
    extract_pairwise_feature_vector,
)
from business_entity_resolution.config import FEATURE_NAMES


def test_feature_vector_dimension():
    e1 = PreprocessedEntity.from_raw("1", "Zenith Logistics Solutions LLC", "742 Evergreen Terrace", "US")
    e2 = PreprocessedEntity.from_raw("2", "Zenith Logistics Solutions", "742 Evergreen Terr.", "US")
    
    feat_dict = extract_pairwise_feature_dict(e1, e2)
    feat_vec = extract_pairwise_feature_vector(e1, e2)
    
    assert len(FEATURE_NAMES) == 33
    assert len(feat_vec) == 33
    assert isinstance(feat_vec, np.ndarray)


def test_feature_values_bounds():
    e1 = PreprocessedEntity.from_raw("1", "Apex Tech", "1042 Industrial Pkwy", "US")
    e2 = PreprocessedEntity.from_raw("2", "Apex Tech", "1042 Industrial Pkwy", "US")
    
    feat_dict = extract_pairwise_feature_dict(e1, e2)
    
    # Identical pairs should have maximum similarity
    assert feat_dict["name_exact_match"] == 1.0
    assert feat_dict["addr_exact_match"] == 1.0
    assert feat_dict["country_exact_match"] == 1.0
    assert feat_dict["name_levenshtein_sim"] == 1.0
    assert feat_dict["addr_levenshtein_sim"] == 1.0
