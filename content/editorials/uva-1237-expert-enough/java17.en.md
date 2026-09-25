For each query, scan every manufacturer and test `low <= price <= high`. Count matches and remember the matched name. Do not stop at the first match, because a later overlapping interval changes the answer to undetermined.

After the complete scan, output the saved name only when the count is exactly one. The problem bounds keep this direct and easily verified `D*Q` work practical.

Ranges include both endpoints, and exactly one matching maker is needed; zero or multiple matches are undetermined.
