import pandas as pd
import os

BASE = "dataset/train"

files = {
    "Source 1": f"{BASE}/train_source1.tsv",
    "Source 2": f"{BASE}/train_source2.tsv",
    "Source 3": f"{BASE}/train_source3.tsv",
    "Ground Truth": f"{BASE}/train_ground_truth.tsv",
}

for name, path in files.items():
    print("\n" + "=" * 60)
    print(name)
    print("=" * 60)

    df = pd.read_csv(path, sep="\t")

    print("Rows:", len(df))
    print("Columns:", list(df.columns))
    print("\nMissing values:")
    print(df.isna().sum())

    print("\nFirst 3 rows:")
    print(df.head(3).to_string(index=False))

    print("\nData types:")
    print(df.dtypes)