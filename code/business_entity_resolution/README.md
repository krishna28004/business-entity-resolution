# Business Entity Resolution Pipeline

This repository contains the code for the Business Entity Resolution Challenge.

## Pipeline Architecture

1. **Data Preparation**
   - Standardization of business names, addresses, and country codes.
   - Text normalization, whitespace cleaning, missing value handling.

2. **Candidate Generation (Blocking)**
   - High-recall blocking and candidate pair filtering.
   - Outputs `output/candidate_pairs.tsv`.

3. **Entity Matching**
   - Record pair classification model using candidate set.
   - Evaluates features on candidate pairs to identify true matches.
   - Outputs `output/matching_results.tsv`.

4. **Output Generation & Validation**
   - Strict TSV formatting and constraint checks:
     - `matching_results.tsv` entity IDs MUST be a subset of `candidate_pairs.tsv` entity IDs for every `source1_entity_id`.

## Directory Structure
```
code/business_entity_resolution/
├── src/
│   ├── preparation/
│   ├── candidate_generation/
│   ├── matching/
│   └── validation/
├── README.md
└── requirements.txt
```

## Setup & Dependencies
See `requirements.txt` for pinned dependencies.
