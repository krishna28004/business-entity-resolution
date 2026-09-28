# System Architecture

## Overview

The **Scalable Business Entity Resolution** system solves the record linkage problem across massive, heterogeneous corporate entity registries. In enterprise data systems, business records originating from different operational data stores, legal jurisdictions, or languages often refer to the exact same real-world organization despite significant typographical, phonetic, structural, and linguistic divergence.

The primary engineering challenge is computational complexity: given $N$ reference query entities and $M$ candidate target entities, an exhaustive pairwise comparison requires $O(N \times M)$ evaluations. For $N \approx 1.73 \times 10^6$ and $M \approx 1.0 \times 10^7$, the unconstrained comparison space exceeds **17.2 Trillion pairs**, making brute-force scoring computationally intractable.

Our architecture solves this through a multi-stage funnel:

```
[Raw Entity Streams (Source 1, Source 2, Source 3)]
                      │
                      ▼
        [1. Unicode-Aware Normalization]
      (NFKC, Legal Suffixes, Address Parsing)
                      │
                      ▼
        [2. Multi-Pass Selective Blocker]
    (9 Passes, Country-Partitioned, DF Caps)
                      │
                      ├───► [Candidate Pairs Store (Cap 125)]
                      ▼
      [3. 33-Dimensional Feature Extractor]
     (Fuzzy, Token Set/Sort, 3-Grams, Meta)
                      │
                      ▼
        [4. Calibrated LightGBM Matcher]
    (Gradient Boosted Probability Estimation)
                      │
                      ▼
   [5. Deterministic Evidence Post-Filter]
    (Building Number & Geographic Collision Guards)
                      │
                      ▼
              [Resolved Entities]
```

---

## Pipeline Components

### 1. Normalization & Preprocessing (`src/business_entity_resolution/normalization.py`)
Standardizes text representations across diverse linguistic and regional standards:
- **Unicode NFKC Decomposition:** Eliminates formatting and character code variations across scripts (Latin, Devanagari, Indic, and accented European characters).
- **Corporate Legal Suffix Stripping:** Identifies and strips generic legal entity designations (e.g., `pvt ltd`, `inc`, `corp`, `llc`, `sarl`, `gmbh`, `ag`) to create an invariant root token representation.
- **Address Decomposition:** Separates numeric building/suite tokens from structural street words (`road` $\rightarrow$ `rd`, `street` $\rightarrow$ `st`) and postal codes (ZIP, PIN).
- **Character N-Gram Generation:** Extracts character 2-grams and 3-grams for transliteration resilience.

### 2. Multi-Pass Inverted Indexing (`src/business_entity_resolution/blocking.py`)
Reduces the candidate comparison space from $O(N \times M)$ to a bounded pool:
- **Strict Country Partitioning:** Entities are isolated by geographic jurisdiction to prevent cross-border false matches.
- **Document-Frequency (DF) Caps:** Prevents high-frequency generic words (e.g., "Enterprises", "Holdings", "Trading") from creating bucket explosions ($DF \le 100$).
- **9 Complementary Blocking Passes:**
  1. Exact Name match (`B1`)
  2. Informative Name Tokens (`B2`)
  3. 5-character Name Prefix (`B3`)
  4. Exact Address match (`B4`)
  5. Informative Address Tokens (`B5`)
  6. Address Numeric Token + Informative Token (`B6`)
  7. Name Token + Address Number (`B7`)
  8. Name Prefix + Postal Code (`B8`)
  9. Character N-Grams with overlap $\ge 2$ (`B9`)
- **Candidate Pool Cap:** Retains the top 125 priority-ranked candidates per reference entity.

### 3. Pairwise Feature Engineering (`src/business_entity_resolution/features.py`)
Computes a 33-dimensional feature vector for each candidate pair:
- **Name Signals:** Exact match, token Jaccard, Levenshtein ratio, token sort similarity, token set similarity, character 3-gram Jaccard, length ratio.
- **Address Signals:** Exact address match, token Jaccard, token overlap count, Levenshtein ratio, token set similarity, character 3-gram Jaccard, numeric token match, numeric token Jaccard, postal code match, postal Jaccard.
- **Interaction & Meta Signals:** Country match, source origin indicators, blocking pass count, cross-feature interaction ($name\_sim \times addr\_sim$), missing field flags, script compatibility flag.

### 4. Gradient-Boosted Classification (`src/business_entity_resolution/matcher.py`)
- **Model:** LightGBM Gradient Boosted Decision Tree (300 estimators, max depth 8, num leaves 63).
- **Probability Calibration:** Predicts pairwise match probabilities calibrated specifically for precision-heavy evaluation.
- **Decision Rule:** Threshold cutoff $\ge 0.998$ with singleton protection margin $\ge 0.15$.

### 5. Deterministic Evidence Post-Filter (`src/business_entity_resolution/post_filter.py`)
A production precision-control stage applying rules derived from training ground-truth empirical analysis:
- **Building Number Guard:** Rejects pairs with conflicting door/building numbers unless name sort similarity $\ge 0.88$ and address score $\ge 0.75$.
- **Geographic Commune Guard:** Suppresses false matches driven solely by shared commune/city names.
- **Substantive Evidence Guard:** Rejects low-confidence candidate collisions lacking independent substantive proof.
- **Relative Margin Pruning:** Retains multi-match candidates within $\Delta = 0.12$ of the top-ranked match.
