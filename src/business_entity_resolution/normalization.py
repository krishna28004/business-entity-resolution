"""
Unicode-safe normalization and feature tokenization module.
Preserves non-Latin scripts, standardizes punctuation/whitespace,
and extracts structural tokens and character n-grams.
"""

import re
import unicodedata
from dataclasses import dataclass
from typing import Any, List, Set, Tuple

import pandas as pd

try:
    from .config import GENERIC_ADDR_TOKENS, GENERIC_LEGAL_TOKENS
except (ImportError, ValueError):
    from config import GENERIC_ADDR_TOKENS, GENERIC_LEGAL_TOKENS


# ==============================================================================
# UNICODE-SAFE NORMALIZATION
# ==============================================================================

def normalize_text(text: Any) -> str:
    """Safely normalizes multilingual text while preserving non-Latin characters.

    1. Convert safely to string; handle NaN/None.
    2. Apply Unicode NFKC normalization (standardizes accents & composite glyphs).
    3. Lowercase (case folding).
    4. Replace punctuation with spaces (preserves all Unicode letters/numbers).
    5. Collapse repeated whitespace and strip.
    """
    if pd.isna(text) or text is None:
        return ""

    text = str(text)
    # Unicode NFKC standardizes characters across all scripts (Latin, Devanagari, etc.)
    text = unicodedata.normalize("NFKC", text)
    text = text.lower()

    # Replace punctuation and underscores with spaces while preserving Unicode letters and digits
    text = re.sub(r"[^\w\s]|_", " ", text, flags=re.UNICODE)
    # Collapse multiple spaces into single space
    text = re.sub(r"\s+", " ", text).strip()

    return text


def get_legal_suffix_stripped(norm_name: str) -> str:
    """Returns normalized name with corporate/legal suffixes stripped.

    Preserves the original if stripping leaves nothing.
    """
    if not norm_name:
        return ""

    tokens = norm_name.split()
    filtered = [t for t in tokens if t not in GENERIC_LEGAL_TOKENS]
    if filtered:
        return " ".join(filtered)
    return norm_name


def get_informative_tokens(norm_text: str, min_len: int = 2) -> List[str]:
    """Extracts non-generic tokens for blocking without destroying raw text."""
    if not norm_text:
        return []

    tokens = norm_text.split()
    informative = [t for t in tokens if len(t) >= min_len and t not in GENERIC_LEGAL_TOKENS]

    # Fallback if all tokens were filtered as generic
    if not informative and tokens:
        informative = [t for t in tokens if len(t) >= min_len]
        if not informative:
            informative = tokens

    return informative


def extract_address_features(norm_addr: str) -> Tuple[List[str], List[str], List[str]]:
    """Extracts structural tokens from normalized address without external data.

    Returns:
        numeric_tokens: list of numeric strings (length 1 to 6, e.g. building/house number)
        postal_tokens: list of postal-code-like numbers (5 to 6 digits)
        informative_addr_tokens: non-generic address words (length >= 4)
    """
    if not norm_addr:
        return [], [], []

    tokens = norm_addr.split()
    numeric_tokens = [t for t in tokens if t.isdigit() and len(t) <= 6]
    postal_tokens = [t for t in tokens if re.match(r"^\d{5,6}$", t)]
    informative_addr_tokens = [
        t for t in tokens
        if len(t) >= 4 and t not in GENERIC_ADDR_TOKENS and not t.isdigit()
    ]

    return numeric_tokens, postal_tokens, informative_addr_tokens


def extract_char_ngrams(text: str, n: int = 3) -> Set[str]:
    """Generates conservative character n-grams from normalized text without spaces."""
    if not text:
        return set()
    compact = text.replace(" ", "")
    if len(compact) < n:
        return {compact} if compact else set()
    return {compact[i:i + n] for i in range(len(compact) - n + 1)}


def detect_script(text: str) -> str:
    """Detects predominant script of the text: 'devanagari', 'latin', 'cjk', 'arabic', or 'other'."""
    if not text:
        return "empty"
    devanagari = 0
    latin = 0
    cjk = 0
    arabic = 0
    total = 0
    for char in text:
        if char.isspace() or char.isdigit():
            continue
        total += 1
        cp = ord(char)
        if 0x0900 <= cp <= 0x097F:
            devanagari += 1
        elif (0x0041 <= cp <= 0x005A) or (0x0061 <= cp <= 0x007A) or (0x00C0 <= cp <= 0x024F):
            latin += 1
        elif 0x4E00 <= cp <= 0x9FFF:
            cjk += 1
        elif 0x0600 <= cp <= 0x06FF:
            arabic += 1

    if total == 0:
        return "empty"
    if devanagari / total > 0.3:
        return "devanagari"
    if cjk / total > 0.3:
        return "cjk"
    if arabic / total > 0.3:
        return "arabic"
    if latin / total > 0.5:
        return "latin"
    return "other"


def are_scripts_compatible(text1: str, text2: str) -> int:
    """Returns 1 if scripts are compatible or one is Latin (potential transliteration), 0 if mutually exclusive non-Latin."""
    s1 = detect_script(text1)
    s2 = detect_script(text2)
    if s1 in ("empty", "other") or s2 in ("empty", "other"):
        return 1
    if s1 == s2:
        return 1
    # If one is Latin and other is Devanagari/CJK, transliteration is possible
    if s1 == "latin" or s2 == "latin":
        return 1
    return 0


# ==============================================================================
# COMPACT PREPROCESSED ENTITY REPRESENTATION
# ==============================================================================

@dataclass(slots=True)
class PreprocessedEntity:
    """Compact preprocessed entity representation storing all views."""
    entity_id: str
    country: str
    norm_name: str
    norm_addr: str
    stripped_name: str
    name_tokens: List[str]
    informative_name_tokens: List[str]
    numeric_addr_tokens: List[str]
    postal_addr_tokens: List[str]
    informative_addr_tokens: List[str]
    name_2grams: Set[str]
    name_3grams: Set[str]
    addr_3grams: Set[str]

    @classmethod
    def from_raw(cls, entity_id: str, business_name: Any, business_address: Any, country: Any) -> "PreprocessedEntity":
        norm_n = normalize_text(business_name)
        norm_a = normalize_text(business_address)
        c_str = str(country).strip() if pd.notna(country) and country is not None else ""

        stripped_n = get_legal_suffix_stripped(norm_n)
        inf_name = get_informative_tokens(norm_n)
        all_name_tok = norm_n.split() if norm_n else []

        num_a, post_a, inf_a = extract_address_features(norm_a)

        n2 = extract_char_ngrams(norm_n, 2)
        n3 = extract_char_ngrams(norm_n, 3)
        a3 = extract_char_ngrams(norm_a, 3)

        return cls(
            entity_id=str(entity_id).strip(),
            country=c_str,
            norm_name=norm_n,
            norm_addr=norm_a,
            stripped_name=stripped_n,
            name_tokens=all_name_tok,
            informative_name_tokens=inf_name,
            numeric_addr_tokens=num_a,
            postal_addr_tokens=post_a,
            informative_addr_tokens=inf_a,
            name_2grams=n2,
            name_3grams=n3,
            addr_3grams=a3
        )
