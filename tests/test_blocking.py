"""
Unit tests for multi-pass selective candidate generation (blocking).
"""

import pytest
from business_entity_resolution.normalization import PreprocessedEntity
from business_entity_resolution.blocking import MultiPassBlocker


def test_blocker_indexing_and_retrieval():
    blocker = MultiPassBlocker()
    e_tgt = PreprocessedEntity.from_raw(
        entity_id="TGT-101",
        business_name="Apex Global Technologies Inc",
        business_address="1042 West Industrial Parkway Suite 300 San Jose CA",
        country="US"
    )
    blocker.index_target_entity(e_tgt)
    
    # Query with exact name
    e_s1 = PreprocessedEntity.from_raw(
        entity_id="REF-001",
        business_name="Apex Global Technologies Inc",
        business_address="1042 West Industrial Parkway Suite 300 San Jose CA",
        country="US"
    )
    cands_dict = blocker.retrieve_candidates(e_s1, max_candidates=50)
    
    # Must retrieve target
    assert "TGT-101" in cands_dict
    hit = cands_dict["TGT-101"]
    assert "B1_exact_name" in hit.hit_passes


def test_blocker_country_isolation():
    blocker = MultiPassBlocker()
    e_us = PreprocessedEntity.from_raw("TGT-US", "Acme Logistics", "123 Main St", "US")
    e_in = PreprocessedEntity.from_raw("TGT-IN", "Acme Logistics", "123 Main St", "India")
    
    blocker.index_target_entity(e_us)
    blocker.index_target_entity(e_in)
    
    # Query with US record should only retrieve US target
    s1_us = PreprocessedEntity.from_raw("REF-US", "Acme Logistics", "123 Main St", "US")
    cands_dict = blocker.retrieve_candidates(s1_us, max_candidates=50)
    
    assert "TGT-US" in cands_dict
    assert "TGT-IN" not in cands_dict
