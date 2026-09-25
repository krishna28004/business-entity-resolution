
import pandas as pd

base = "dataset/train/"

s1 = pd.read_csv(base + "train_source1.tsv", sep="\t")
s2 = pd.read_csv(base + "train_source2.tsv", sep="\t")
s3 = pd.read_csv(base + "train_source3.tsv", sep="\t")
gt = pd.read_csv(base + "train_ground_truth.tsv", sep="\t")

# 1. Country distribution
for name, df in [("S1", s1), ("S2", s2), ("S3", s3)]:
    print(f"\n{name} countries:")
    print(df["country"].value_counts())

# 2. Match distribution
gt["match_count"] = gt["matched_entity_ids"].fillna("").apply(
    lambda x: len(x.split(",")) if x else 0
)

print("\nMatch count distribution:")
print(gt["match_count"].value_counts().sort_index().head(15))

print("\nMaximum matches for one S1:", gt["match_count"].max())
print("Average matches:", gt["match_count"].mean())

# 3. Duplicate business names
for name, df in [("S1", s1), ("S2", s2), ("S3", s3)]:
    print(f"\n{name} duplicate business names:",
          df["business_name"].duplicated().sum())