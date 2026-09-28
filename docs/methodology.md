# Matching Methodology & Mathematical Formulation

## 1. Problem Formulation

Let $\mathcal{S}_1$ be the set of reference enterprise entities, and let $\mathcal{T} = \mathcal{S}_2 \cup \mathcal{S}_3$ be the target entity universe. Each entity $e = (n, a, c)$ consists of a business name $n$, address $a$, and jurisdiction country $c$.

The objective is to identify a matching mapping $\mathcal{M} \subset \mathcal{S}_1 \times \mathcal{T}$ such that $(s_1, t) \in \mathcal{M}$ if and only if $s_1$ and $t$ correspond to the same underlying corporate entity in the physical world.

### Evaluation Metric: Macro $F_{0.5}$
The evaluation objective is Macro $F_{0.5}$, emphasizing precision over recall with $\beta = 0.5$:

$$F_{0.5} = \frac{(1 + \beta^2) \cdot \text{Precision} \cdot \text{Recall}}{\beta^2 \cdot \text{Precision} + \text{Recall}} = \frac{1.25 \cdot \text{Precision} \cdot \text{Recall}}{0.25 \cdot \text{Precision} + \text{Recall}}$$

In this formulation, a false positive merge is penalized twice as heavily as an omitted match. An entity resolution system that aggressively over-merges distinct entities sharing common keywords experiences catastrophic degradation in macro score.

---

## 2. Multi-Pass Candidate Generation

Exhaustive matching over $\mathcal{S}_1 \times \mathcal{T}$ requires $1.73 \times 10^6 \times 9.97 \times 10^6 \approx 1.72 \times 10^{13}$ pairwise comparisons.

We construct 9 index passes partitioned by country:
$$\mathcal{B}_k(e) = \{(country(e), \text{key}_k(e))\}$$

For any token $w$, we track document frequency $DF(w)$ across the target corpus. If $DF(w) > 100$, the token is suppressed from inverted indexing to prevent generic keyword explosions.

Retrieved candidate pairs $(s_1, t)$ are scored by a deterministic priority function:
$$\text{Priority}(s_1, t) = 10 \cdot |\mathcal{H}| + 50 \cdot \mathbb{I}(B_1) + 40 \cdot \mathbb{I}(B_4) + 30 \cdot (\mathbb{I}(B_7) \lor \mathbb{I}(B_8)) + 20 \cdot \mathbb{I}(B_6)$$
where $\mathcal{H}$ is the set of blocking passes that retrieved $t$. The candidate set for $s_1$ is capped at the top 125 candidates.

---

## 3. Pairwise Feature Engineering

The 33 features capture complementary dimensions of similarity:

### Name Similarity Metrics
1. `name_exact_match` $\in \{0, 1\}$
2. `name_token_jaccard` $= \frac{|T(n_1) \cap T(n_2)|}{|T(n_1) \cup T(n_2)|}$
3. `name_token_overlap_count` $= |T(n_1) \cap T(n_2)|$
4. `name_token_overlap_ratio` $= \frac{|T(n_1) \cap T(n_2)|}{\min(|T(n_1)|, |T(n_2)|)}$
5. `name_levenshtein_sim` $= 1 - \frac{\text{Levenshtein}(n_1, n_2)}{\max(|n_1|, |n_2|)}$
6. `name_token_sort_sim`: Levenshtein ratio computed over alphabetically sorted tokens.
7. `name_token_set_sim`: Levenshtein ratio computed over deduplicated intersection and remainder sets.
8. `name_char_ngram_jaccard`: Jaccard index over character 3-grams.
9. `name_length_ratio` $= \frac{\min(|n_1|, |n_2|)}{\max(|n_1|, |n_2|)}$
10. `name_stripped_exact` $\in \{0, 1\}$: Exact match after corporate legal suffix removal.
11. `name_stripped_token_sort_sim`

### Address Similarity Metrics
12. `addr_exact_match` $\in \{0, 1\}$
13. `addr_token_jaccard`
14. `addr_token_overlap_count`
15. `addr_token_overlap_ratio`
16. `addr_levenshtein_sim`
17. `addr_token_set_sim`
18. `addr_char_ngram_jaccard`
19. `addr_length_ratio`
20. `addr_has_number_match` $\in \{0, 1\}$: Agreement between numeric building/door tokens.
21. `addr_numeric_jaccard`: Jaccard index over numeric address tokens.
22. `addr_postal_match` $\in \{0, 1\}$: Agreement between postal codes.
23. `addr_postal_jaccard`

### Interaction & Meta Metrics
24. `country_exact_match` $\in \{0, 1\}$
25. `source_is_s2` $\in \{0, 1\}$
26. `source_is_s3` $\in \{0, 1\}$
27. `num_blocking_passes`
28. `name_sim_x_addr_sim` $= \text{name\_token\_set\_sim} \times \text{addr\_token\_set\_sim}$
29. `s1_has_missing_addr`
30. `target_has_missing_addr`
31. `s1_has_missing_name`
32. `target_has_missing_name`
33. `scripts_compatible` $\in \{0, 1\}$: Identifies cross-script transliteration feasibility.

---

## 4. Empirical Error Analysis Findings

1. **Target Density Distribution Mismatch:** In small validation slices, false positives are rare because competing distractors do not populate the database. At full 10-million target scale, common entity names encounter dozens of lexical lookalikes, necessitating high decision thresholds and post-filtering.
2. **Building Number Disambiguation:** Ground-truth analysis on 2.2M verified entity pairs revealed that true matches have identical building numbers in 75.24% of cases and unstated numbers in 16.48%. Fewer than 8.3% have conflicting numbers (typically typos). Enforcing a building number mismatch guard suppresses over 60% of false commercial complex collisions.
3. **Geographic Commune Collisions:** In European registries with high commune density, businesses in the same postal code or municipality frequently share identical address prefixes. Strict name-score qualification prevents false merges driven by location alone.
