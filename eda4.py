import pandas as pd
import re

BASE = "dataset/train/"

# Load S1 and ground truth
s1 = pd.read_csv(
    BASE + "train_source1.tsv",
    sep="\t",
    usecols=["entity_id", "business_name", "business_address", "country"]
)

gt = pd.read_csv(
    BASE + "train_ground_truth.tsv",
    sep="\t"
)

# Take 10,000 random S1 records for analysis
sample = s1.sample(n=10000, random_state=42)

print("Sample size:", len(sample))

# -----------------------------
# Normalization
# -----------------------------

def normalize(text):
    if pd.isna(text):
        return ""

    text = str(text).lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()

sample["name_norm"] = sample["business_name"].apply(normalize)
sample["address_norm"] = sample["business_address"].apply(normalize)

# -----------------------------
# Ground truth
# -----------------------------

gt_sample = gt[
    gt["source1_entity_id"].isin(sample["entity_id"])
].copy()

gt_sample["matched_entity_ids"] = gt_sample[
    "matched_entity_ids"
].fillna("")

# Number of true matches
gt_sample["match_count"] = gt_sample[
    "matched_entity_ids"
].apply(
    lambda x: len(x.split(",")) if x else 0
)

print("\nGround truth in sample:")
print(gt_sample["match_count"].value_counts().sort_index())

print("\nSingletons in sample:",
      (gt_sample["match_count"] == 0).sum())

# -----------------------------
# Basic statistics
# -----------------------------

print("\n=== NAME STATISTICS ===")

print("Unique normalized names:",
      sample["name_norm"].nunique())

print("Duplicate normalized names:",
      sample["name_norm"].duplicated().sum())

print("\n=== ADDRESS STATISTICS ===")

print("Unique normalized addresses:",
      sample["address_norm"].nunique())

print("Duplicate normalized addresses:",
      sample["address_norm"].duplicated().sum())

print("\n=== COUNTRY ===")
print(sample["country"].value_counts())

print("\nAnalysis complete.")