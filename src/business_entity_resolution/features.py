"""
Feature engineering module.
Extracts high-signal pairwise features between S1 reference records
and S2/S3 candidate target records.
"""

from typing import Any, Dict, List, Optional, Set, Tuple
import numpy as np

try:
    from rapidfuzz import fuzz
    HAS_RAPIDFUZZ = True
except ImportError:
    HAS_RAPIDFUZZ = False
    from difflib import SequenceMatcher

try:
    from .config import FEATURE_NAMES
    from .normalization import PreprocessedEntity, are_scripts_compatible
except (ImportError, ValueError):
    from config import FEATURE_NAMES
    from normalization import PreprocessedEntity, are_scripts_compatible


# ==============================================================================
# FAST HELPER FUNCTIONS
# ==============================================================================

def set_jaccard(s1: Set[Any], s2: Set[Any]) -> float:
    """Computes Jaccard similarity between two sets."""
    if not s1 and not s2:
        return 0.0
    u = len(s1 | s2)
    if u == 0:
        return 0.0
    return len(s1 & s2) / u


def token_overlap(tokens1: List[str], tokens2: List[str]) -> Tuple[int, float]:
    """Returns (overlap_count, overlap_ratio_relative_to_min)."""
    s1 = set(tokens1)
    s2 = set(tokens2)
    common = len(s1 & s2)
    min_len = min(len(s1), len(s2))
    ratio = (common / min_len) if min_len > 0 else 0.0
    return common, ratio


def string_ratio_sim(str1: str, str2: str) -> float:
    """Computes normalized edit similarity [0, 1]."""
    if not str1 or not str2:
        return 0.0
    if HAS_RAPIDFUZZ:
        return fuzz.ratio(str1, str2) / 100.0
    return SequenceMatcher(None, str1, str2).ratio()


def token_sort_sim(str1: str, str2: str) -> float:
    """Computes token sort ratio [0, 1]."""
    if not str1 or not str2:
        return 0.0
    if HAS_RAPIDFUZZ:
        return fuzz.token_sort_ratio(str1, str2) / 100.0
    s1 = " ".join(sorted(str1.split()))
    s2 = " ".join(sorted(str2.split()))
    return SequenceMatcher(None, s1, s2).ratio()


def token_set_sim(str1: str, str2: str) -> float:
    """Computes token set ratio [0, 1]."""
    if not str1 or not str2:
        return 0.0
    if HAS_RAPIDFUZZ:
        return fuzz.token_set_ratio(str1, str2) / 100.0
    s1 = set(str1.split())
    s2 = set(str2.split())
    inter = " ".join(sorted(s1 & s2))
    diff1 = " ".join(sorted(s1 - s2))
    diff2 = " ".join(sorted(s2 - s1))
    t1 = (inter + " " + diff1).strip()
    t2 = (inter + " " + diff2).strip()
    return SequenceMatcher(None, t1, t2).ratio()


def len_ratio(len1: int, len2: int) -> float:
    """Computes length ratio min / max."""
    if len1 == 0 and len2 == 0:
        return 1.0
    if len1 == 0 or len2 == 0:
        return 0.0
    return min(len1, len2) / max(len1, len2)


# ==============================================================================
# PAIRWISE FEATURE VECTOR EXTRACTION
# ==============================================================================

def extract_pairwise_feature_dict(
    s1: PreprocessedEntity,
    target: PreprocessedEntity,
    hit_passes: Optional[Set[str]] = None
) -> Dict[str, float]:
    """Extracts all pairwise features for an (S1, Target) candidate pair."""
    feat: Dict[str, float] = {}

    # 1. Name features
    s1_n = s1.norm_name
    tgt_n = target.norm_name
    feat["name_exact_match"] = 1.0 if (s1_n and s1_n == tgt_n) else 0.0

    name_s1_toks = s1.name_tokens
    name_tgt_toks = target.name_tokens
    s1_name_set = set(name_s1_toks)
    tgt_name_set = set(name_tgt_toks)

    feat["name_token_jaccard"] = set_jaccard(s1_name_set, tgt_name_set)
    n_common, n_ratio = token_overlap(name_s1_toks, name_tgt_toks)
    feat["name_token_overlap_count"] = float(n_common)
    feat["name_token_overlap_ratio"] = n_ratio

    feat["name_levenshtein_sim"] = string_ratio_sim(s1_n, tgt_n)
    feat["name_token_sort_sim"] = token_sort_sim(s1_n, tgt_n)
    feat["name_token_set_sim"] = token_set_sim(s1_n, tgt_n)
    feat["name_char_ngram_jaccard"] = set_jaccard(s1.name_3grams, target.name_3grams)
    feat["name_length_ratio"] = len_ratio(len(s1_n), len(tgt_n))
    feat["name_token_len_diff"] = float(abs(len(name_s1_toks) - len(name_tgt_toks)))
    feat["name_legal_suffix_stripped_sim"] = token_sort_sim(s1.stripped_name, target.stripped_name)

    # 2. Address features
    s1_a = s1.norm_addr
    tgt_a = target.norm_addr
    feat["addr_exact_match"] = 1.0 if (s1_a and s1_a == tgt_a) else 0.0

    addr_s1_toks = s1_a.split() if s1_a else []
    addr_tgt_toks = tgt_a.split() if tgt_a else []
    s1_addr_set = set(addr_s1_toks)
    tgt_addr_set = set(addr_tgt_toks)

    feat["addr_token_jaccard"] = set_jaccard(s1_addr_set, tgt_addr_set)
    a_common, a_ratio = token_overlap(addr_s1_toks, addr_tgt_toks)
    feat["addr_token_overlap_count"] = float(a_common)
    feat["addr_token_overlap_ratio"] = a_ratio

    feat["addr_levenshtein_sim"] = string_ratio_sim(s1_a, tgt_a)
    feat["addr_token_set_sim"] = token_set_sim(s1_a, tgt_a)
    feat["addr_char_ngram_jaccard"] = set_jaccard(s1.addr_3grams, target.addr_3grams)
    feat["addr_length_ratio"] = len_ratio(len(s1_a), len(tgt_a))

    # Structural address numbers
    s1_nums = set(s1.numeric_addr_tokens)
    tgt_nums = set(target.numeric_addr_tokens)
    num_common = len(s1_nums & tgt_nums)
    feat["addr_has_number_match"] = 1.0 if num_common > 0 else 0.0
    feat["addr_numeric_jaccard"] = set_jaccard(s1_nums, tgt_nums)

    # Postal codes
    s1_post = set(s1.postal_addr_tokens)
    tgt_post = set(target.postal_addr_tokens)
    post_common = len(s1_post & tgt_post)
    feat["addr_postal_match"] = 1.0 if post_common > 0 else 0.0
    feat["addr_postal_jaccard"] = set_jaccard(s1_post, tgt_post)

    # 3. Interaction & meta features
    s1_c = s1.country.lower()
    tgt_c = target.country.lower()
    feat["country_exact_match"] = 1.0 if (s1_c and s1_c == tgt_c) else 0.0

    tid = target.entity_id
    feat["source_is_s2"] = 1.0 if tid.startswith("S2-") else 0.0
    feat["source_is_s3"] = 1.0 if tid.startswith("S3-") else 0.0

    passes = hit_passes if hit_passes is not None else set()
    feat["num_blocking_passes"] = float(len(passes))
    feat["name_sim_x_addr_sim"] = feat["name_token_set_sim"] * feat["addr_token_set_sim"]

    feat["s1_has_missing_addr"] = 1.0 if not s1_a else 0.0
    feat["target_has_missing_addr"] = 1.0 if not tgt_a else 0.0
    feat["s1_has_missing_name"] = 1.0 if not s1_n else 0.0
    feat["target_has_missing_name"] = 1.0 if not tgt_n else 0.0
    feat["scripts_compatible"] = float(are_scripts_compatible(s1_n, tgt_n))

    return feat


def extract_pairwise_feature_vector(
    s1: PreprocessedEntity,
    target: PreprocessedEntity,
    hit_passes: Optional[Set[str]] = None
) -> np.ndarray:
    """Extracts a flat NumPy feature vector aligned with FEATURE_NAMES."""
    feat_dict = extract_pairwise_feature_dict(s1, target, hit_passes)
    return np.array([feat_dict.get(col, 0.0) for col in FEATURE_NAMES], dtype=np.float32)
