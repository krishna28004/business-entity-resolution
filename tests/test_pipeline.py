"""
Unit tests for deterministic evidence rules and precision post-filtering.
"""

import pytest
from business_entity_resolution.post_filter import preprocess_raw, is_pair_valid_match


def test_positive_match_acceptance():
    s1 = preprocess_raw("Zenith Logistics Solutions LLC", "742 Evergreen Terrace Springfield IL", "US")
    tgt = preprocess_raw("Zenith Logistics Solutions", "742 Evergreen Terr. Springfield Illinois", "US")
    
    valid, score = is_pair_valid_match(s1, tgt)
    assert valid is True
    assert score > 0.80


def test_building_number_mismatch_guard():
    # Different building numbers with distinct company names should be rejected
    s1 = preprocess_raw("Kalyani Metals", "Plot 45 Sector 18 Industrial Area", "India")
    tgt = preprocess_raw("Kalyani Steel & Hardware", "Plot 92 Sector 18 Industrial Area", "India")
    
    valid, score = is_pair_valid_match(s1, tgt)
    # Number mismatch with non-exact name should be suppressed
    assert valid is False


def test_france_commune_guard():
    # Distinct businesses sharing commune name should not collide
    s1 = preprocess_raw("Boulangerie Artisanale", "14 Rue de la Paix 75002 Paris", "France")
    tgt = preprocess_raw("Pharmacie du Centre", "14 Rue de la Paix 75002 Paris", "France")
    
    valid, score = is_pair_valid_match(s1, tgt)
    assert valid is False
