import pandas as pd
import re
from difflib import SequenceMatcher

BASE = "dataset/train/"

print("Loading data...")

s1 = pd.read_csv(
    BASE + "train_source1.tsv",
    sep="\t",
    usecols=["entity_id", "business_name", "business_address", "country"]
)

s2 = pd.read_csv(
    BASE + "train_source2.tsv",
    sep="\t",
    usecols=["entity_id", "business_name", "business_address", "country"]
)

s3 = pd.read_csv(
    BASE + "train_source3.tsv",
    sep="\t",
    usecols=["entity_id", "business_name", "business_address", "country"]
)

gt = pd.read_csv(
    BASE + "train_ground_truth.tsv",
    sep="\t"
)

# -----------------------------
# Unicode-safe normalization
# -----------------------------

def normalize(text):
    if pd.isna(text):
        return ""

    text = str(text).lower()

    # Keep Unicode letters/numbers.
    text = re.sub(r"[^\w\s]", " ", text, flags=re.UNICODE)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# Create lookup dictionaries
s2_lookup = s2.set_index("entity_id").to_dict("index")
s3_lookup = s3.set_index("entity_id").to_dict("index")
s1_lookup = s1.set_index("entity_id").to_dict("index")


# -----------------------------
# Sample S1 records
# -----------------------------

sample_gt = gt.sample(
    n=2000,
    random_state=42
)

results = []

for _, row in sample_gt.iterrows():

    s1_id = row["source1_entity_id"]
    matched_ids = row["matched_entity_ids"]

    if pd.isna(matched_ids) or not str(matched_ids).strip():
        continue

    source1 = s1_lookup[s1_id]

    name1 = normalize(source1["business_name"])
    address1 = normalize(source1["business_address"])

    for match_id in str(matched_ids).split(","):

        match_id = match_id.strip()

        if match_id.startswith("S2-"):
            target = s2_lookup.get(match_id)
        elif match_id.startswith("S3-"):
            target = s3_lookup.get(match_id)
        else:
            continue

        if target is None:
            continue

        name2 = normalize(target["business_name"])
        address2 = normalize(target["business_address"])

        name_similarity = SequenceMatcher(
            None,
            name1,
            name2
        ).ratio()

        address_similarity = SequenceMatcher(
            None,
            address1,
            address2
        ).ratio()

        results.append({
            "s1_id": s1_id,
            "match_id": match_id,
            "country": source1["country"],
            "name1": source1["business_name"],
            "name2": target["business_name"],
            "address1": source1["business_address"],
            "address2": target["business_address"],
            "name_similarity": name_similarity,
            "address_similarity": address_similarity
        })


df = pd.DataFrame(results)

print("\n===================================")
print("TRUE MATCH ANALYSIS")
print("===================================")

print("\nTrue matched pairs analysed:", len(df))

print("\nNAME SIMILARITY:")
print(df["name_similarity"].describe())

print("\nADDRESS SIMILARITY:")
print(df["address_similarity"].describe())

print("\nCOUNTRY:")
print(df["country"].value_counts())

# Similarity buckets

print("\nNAME SIMILARITY BUCKETS:")

print(
    pd.cut(
        df["name_similarity"],
        bins=[0, .2, .4, .6, .7, .8, .9, .95, 1.0],
        include_lowest=True
    ).value_counts().sort_index()
)

print("\nADDRESS SIMILARITY BUCKETS:")

print(
    pd.cut(
        df["address_similarity"],
        bins=[0, .2, .4, .6, .7, .8, .9, .95, 1.0],
        include_lowest=True
    ).value_counts().sort_index()
)

# Show difficult true matches

print("\n===================================")
print("DIFFICULT TRUE MATCHES")
print("===================================")

hard = df.sort_values(
    ["name_similarity", "address_similarity"]
).head(20)

for _, r in hard.iterrows():

    print("\nS1:", r["s1_id"])
    print("MATCH:", r["match_id"])
    print("NAME 1:", r["name1"])
    print("NAME 2:", r["name2"])
    print("ADDRESS 1:", r["address1"])
    print("ADDRESS 2:", r["address2"])
    print("Name similarity:",
          round(r["name_similarity"], 3))
    print("Address similarity:",
          round(r["address_similarity"], 3))