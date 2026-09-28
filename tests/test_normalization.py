"""
Unit tests for data normalization and multi-script preprocessing.
"""

import pytest
from business_entity_resolution.normalization import (
    normalize_text,
    get_legal_suffix_stripped,
    extract_address_features,
    detect_script,
    are_scripts_compatible,
    PreprocessedEntity,
)


def test_normalize_text():
    # Test case folding and whitespace stripping
    assert normalize_text("  ACME   HOLDINGS   LTD  ") == "acme holdings ltd"
    # Test punctuation normalization
    assert normalize_text("Apex-Global, LLC.") == "apex global llc"
    # Test unicode NFKC normalization preserves unicode characters
    assert "société" in normalize_text("Société d'Électricité")


def test_legal_suffix_stripping():
    # International and regional corporate legal suffixes
    assert get_legal_suffix_stripped("kalyani textile pvt ltd") == "kalyani textile"
    assert get_legal_suffix_stripped("apex robotics inc") == "apex robotics"
    assert get_legal_suffix_stripped("boulangerie saint germain sarl") == "boulangerie saint germain"
    assert get_legal_suffix_stripped("nandlal agri llp") == "nandlal agri"


def test_address_feature_extraction():
    addr = normalize_text("1042 West Industrial Parkway Suite 300 San Jose CA 95112")
    nums, postal, inf = extract_address_features(addr)
    # Check numeric tokens
    assert "1042" in nums
    assert "300" in nums
    # Check postal tokens
    assert "95112" in postal
    # Check informative address tokens
    assert "industrial" in inf
    assert "parkway" in inf


def test_script_detection_and_compatibility():
    latin_text = "Apex Global Technologies"
    indic_text = "नंदलाल किसान"
    
    assert detect_script(latin_text) == "latin"
    assert detect_script(indic_text) == "devanagari"
    # Latin and Devanagari are compatible for transliteration
    assert are_scripts_compatible(latin_text, indic_text) == 1
