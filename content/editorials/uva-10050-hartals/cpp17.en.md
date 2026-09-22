Each case creates a `days+1` boolean vector so dates can be used directly as one-based indices. A party loop begins at its positive period and advances by that period. The loop variable is `long long`, keeping the final increment safe even when it passes the bound.

The answer scan occurs only after every party has marked dates. Residues six and zero correspond to Friday and Saturday, and both must be absent before incrementing. A period greater than `days` naturally performs zero iterations while input parsing continues correctly.
