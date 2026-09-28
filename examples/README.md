# Synthetic Demonstration Dataset

This directory contains a standalone, synthetic demonstration dataset designed to showcase the entity resolution pipeline without requiring access to large private or proprietary databases.

## Files

- `sample_source1.csv`: 20 reference entities representing diverse enterprise records across multiple jurisdictions (US, India, France) and industries.
- `sample_source2.csv`: 34 target candidate entities containing realistic real-world noise:
  - Dropped and abbreviated corporate legal suffixes (e.g., `Inc.`, `LLC`, `Pvt. Ltd.`, `SARL`, `SAS`).
  - Street abbreviation and reordering variations (`Parkway` vs `Pkwy`, `Drive` vs `Dr`).
  - Cross-script transliterations (Latin English vs Devanagari script).
  - Hard-negative distractors sharing city names, street sectors, and commercial addresses.
- `sample_ground_truth.csv`: Benchmark entity linkages mapping Source-1 reference IDs to true matching Target IDs, including true zero-match entities.
- `run_demo.py`: Self-contained script executing end-to-end normalization, candidate generation, pairwise feature extraction, and deterministic evidence matching in under 2 seconds.

## Running the Demo

From the project root:

```bash
python examples/run_demo.py
```
