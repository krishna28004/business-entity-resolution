"""
Configuration module for Business Entity Resolution.
Defines system paths, hyperparameters, blocking parameters,
generic stopwords, and feature column schemas.
"""

from pathlib import Path
from typing import Dict, List, Set, Any

# ==============================================================================
# 1. FILE & DIRECTORY PATHS
# ==============================================================================

SRC_DIR = Path(__file__).resolve().parent

def _find_project_root(start: Path) -> Path:
    curr = start
    for _ in range(5):
        if (curr / "pyproject.toml").exists() or (curr / ".git").exists():
            return curr
        if curr == curr.parent:
            break
        curr = curr.parent
    return start.parent.parent

PROJECT_ROOT = _find_project_root(SRC_DIR)

# Dataset directories
DATASET_DIR = PROJECT_ROOT / "dataset"
TRAIN_DIR = DATASET_DIR / "train"
TEST_DIR = DATASET_DIR / "test"

# Train datasets
TRAIN_GROUND_TRUTH_PATH = TRAIN_DIR / "train_ground_truth.tsv"
TRAIN_SOURCE1_PATH = TRAIN_DIR / "train_source1.tsv"
TRAIN_SOURCE2_PATH = TRAIN_DIR / "train_source2.tsv"
TRAIN_SOURCE3_PATH = TRAIN_DIR / "train_source3.tsv"

# Test datasets
TEST_SOURCE1_PATH = TEST_DIR / "test_source1.tsv"
TEST_SOURCE2_PATH = TEST_DIR / "test_source2.tsv"
TEST_SOURCE3_PATH = TEST_DIR / "test_source3.tsv"

# Outputs & Artifacts
OUTPUT_DIR = PROJECT_ROOT / "output"
OUTPUT_MATCHING_PATH = OUTPUT_DIR / "matching_results.tsv"
OUTPUT_CANDIDATE_PATH = OUTPUT_DIR / "candidate_pairs.tsv"
INDEX_DIR = OUTPUT_DIR / "target_index"
TARGET_DB_PATH = INDEX_DIR / "target_index.db"

MODELS_DIR = PROJECT_ROOT / "models"
SAVED_MODEL_PATH = MODELS_DIR / "matching_model.joblib"

RESULTS_DIR = PROJECT_ROOT / "results"
VALIDATION_METRICS_PATH = RESULTS_DIR / "validation_metrics.tsv"
ERROR_ANALYSIS_PATH = RESULTS_DIR / "error_analysis.tsv"

# Validator script
VALIDATOR_SCRIPT_PATH = PROJECT_ROOT / "utils" / "validate_submission.py"

# ==============================================================================
# 2. GENERAL PARAMETERS
# ==============================================================================

RANDOM_SEED = 42
CHUNK_SIZE = 100_000

# ==============================================================================
# 3. NORMALIZATION & STOPWORDS
# ==============================================================================

# Multilingual corporate & legal suffixes (open-set country compliant: US, India, France, etc.)
GENERIC_LEGAL_TOKENS: Set[str] = {
    # English & International
    "inc", "incorporated", "llc", "ltd", "limited", "pvt", "private",
    "corp", "corporation", "co", "company", "companies", "the", "and", "of",
    "in", "at", "for", "by", "to", "llp", "plc", "holdings", "group", "services",
    "enterprises", "solutions", "international", "associates", "global", "industries",
    # French & European (for test set awareness: France & open set)
    "sa", "sarl", "sas", "sasu", "eurl", "cie", "ste", "societe", "et",
    "gmbh", "ag", "bv", "nv", "srl", "spa"
}

# Generic address tokens across multiple jurisdictions
GENERIC_ADDR_TOKENS: Set[str] = {
    "street", "road", "st", "rd", "avenue", "ave", "lane", "drive", "dr", "way",
    "court", "ct", "boulevard", "blvd", "highway", "hwy", "route", "floor", "flr",
    "suite", "ste", "unit", "apt", "apartment", "building", "bldg", "block", "sector",
    "phase", "near", "opp", "opposite", "behind", "beside", "chowk", "nagar",
    "marg", "bazaar", "dist", "district", "state", "city", "north", "south", "east", "west",
    "cross", "main", "first", "second", "third", "rue", "chemin", "boulevard", "allee",
    "place", "impasse", "route"
}

# ==============================================================================
# 4. BLOCKING PARAMETERS & CANDIDATE EXPLOSION CONTROL
# ==============================================================================

# Document frequency caps to avoid pathological buckets
NAME_TOKEN_MAX_DF = 100
ADDR_TOKEN_MAX_DF = 100
ADDR_NUM_TOKEN_MAX_DF = 200
NGRAM_MAX_DF = 500

# Bucket caps (max targets indexed per key)
BUCKET_CAP_TOKEN = 500
BUCKET_CAP_PREFIX = 500
BUCKET_CAP_ADDR = 500
BUCKET_CAP_COMPOSITE = 500

# Candidate caps per S1
MAX_CANDIDATES_PER_S1_BLOCK = 500
MAX_TOTAL_CANDIDATES_PER_S1 = 200
MAX_NGRAM_CANDIDATES_PER_S1 = 200

# Multilingual n-gram settings
MIN_NGRAM_LEN = 2
MAX_NGRAM_LEN = 3
MIN_NGRAM_OVERLAP = 2

# ==============================================================================
# 5. FEATURE SCHEMA
# ==============================================================================

FEATURE_NAMES: List[str] = [
    # Name features
    "name_exact_match",
    "name_token_jaccard",
    "name_token_overlap_count",
    "name_token_overlap_ratio",
    "name_levenshtein_sim",
    "name_token_sort_sim",
    "name_token_set_sim",
    "name_char_ngram_jaccard",
    "name_length_ratio",
    "name_token_len_diff",
    "name_legal_suffix_stripped_sim",
    # Address features
    "addr_exact_match",
    "addr_token_jaccard",
    "addr_token_overlap_count",
    "addr_token_overlap_ratio",
    "addr_levenshtein_sim",
    "addr_token_set_sim",
    "addr_char_ngram_jaccard",
    "addr_length_ratio",
    "addr_has_number_match",
    "addr_numeric_jaccard",
    "addr_postal_match",
    "addr_postal_jaccard",
    # Interaction & meta features
    "country_exact_match",
    "source_is_s2",
    "source_is_s3",
    "num_blocking_passes",
    "name_sim_x_addr_sim",
    "s1_has_missing_addr",
    "target_has_missing_addr",
    "s1_has_missing_name",
    "target_has_missing_name",
    "scripts_compatible"
]

# ==============================================================================
# 6. MODEL HYPERPARAMETERS
# ==============================================================================

LIGHTGBM_PARAMS: Dict[str, Any] = {
    "n_estimators": 300,
    "learning_rate": 0.05,
    "num_leaves": 63,
    "max_depth": 8,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "random_state": RANDOM_SEED,
    "n_jobs": -1,
    "verbose": -1,
}

HIST_GRADIENT_BOOSTING_PARAMS: Dict[str, Any] = {
    "max_iter": 300,
    "learning_rate": 0.05,
    "max_leaf_nodes": 63,
    "max_depth": 8,
    "random_state": RANDOM_SEED,
}

# ==============================================================================
# 7. THRESHOLD SEARCH RANGE
# ==============================================================================

CALIBRATION_THRESHOLDS: List[float] = [
    0.30, 0.40, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95
]

DEFAULT_PROBABILITY_THRESHOLD = 0.998
SINGLETON_MARGIN_THRESHOLD = 0.15
