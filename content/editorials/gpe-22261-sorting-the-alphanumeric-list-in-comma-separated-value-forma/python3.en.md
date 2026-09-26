Keep display text separate from sorting keys. Preserve each original line exactly, including spaces around commas. Split another representation into fields and remove only leading/trailing ASCII spaces from each field to form its key.

Compare records field by field, not as raw lines. The first differing field determines lexical order. If all shared fields match and one record ends first, the shorter field tuple comes first. Numeric-looking fields remain strings: 10 sorts before 2; do not invent numeric or natural sorting.

Empty fields still count. Splitting must preserve adjacent commas and a trailing comma. C splits a copied buffer manually, Python split(',') preserves empties, and Java split(",",−1) does too. Trimming keys must never modify original output text.

Retain duplicate rows and equal keys; a set would incorrectly discard records. C uses original index as a tie breaker, while stable Python/Java sorting preserves input order. Other equal-key orders are also valid. Separate datasets with a blank line.

For M records, at most L fields and D characters per field, sorting takes O(M log M·LD) in the worst case. Original lines and keys use O(MLD) storage.
