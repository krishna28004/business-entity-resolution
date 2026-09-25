import pandas as pd

base = "dataset/train/"

# Only load the columns we need
s1 = pd.read_csv(
    base + "train_source1.tsv",
    sep="\t",
    usecols=["entity_id", "country"]
)

gt = pd.read_csv(
    base + "train_ground_truth.tsv",
    sep="\t"
)

# Match count
gt["matched_entity_ids"] = gt["matched_entity_ids"].fillna("")

gt["match_count"] = gt["matched_entity_ids"].apply(
    lambda x: len(x.split(",")) if x else 0
)

# Count S2 vs S3 matches
def count_source_ids(x, prefix):
    if not x:
        return 0
    return sum(1 for item in x.split(",") if item.startswith(prefix))

gt["s2_count"] = gt["matched_entity_ids"].apply(
    lambda x: count_source_ids(x, "S2-")
)

gt["s3_count"] = gt["matched_entity_ids"].apply(
    lambda x: count_source_ids(x, "S3-")
)

# Merge Source 1 country
df = gt.merge(
    s1,
    left_on="source1_entity_id",
    right_on="entity_id",
    how="left"
)

print("\n=== MATCH COMPOSITION ===")

print("\nS2 match count distribution:")
print(df["s2_count"].value_counts().sort_index())

print("\nS3 match count distribution:")
print(df["s3_count"].value_counts().sort_index())

print("\n=== MATCHES BY SOURCE 1 COUNTRY ===")

print(
    df.groupby("country")["match_count"]
      .agg(["count", "mean", "min", "max"])
)

print("\n=== SINGLETONS BY COUNTRY ===")

print(
    df[df["match_count"] == 0]["country"]
    .value_counts()
)

print("\n=== MATCH COUNT BY COUNTRY ===")

print(
    pd.crosstab(
        df["country"],
        df["match_count"]
    )
)

print("\n=== TOTAL MATCHED IDS ===")
print("S2 IDs:", df["s2_count"].sum())
print("S3 IDs:", df["s3_count"].sum())
print("Total:", df["match_count"].sum())