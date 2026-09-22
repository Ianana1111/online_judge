Candidate names are read with `getline`, preserving internal spaces; only a trailing CR is removed. Ballot lines use a separate string stream and convert one-based IDs to zero-based indices.

Each ballot loop stops at its first alive ID. The integer comparison `2*most > ballots.size()` implements strict majority exactly. Zero-ballot datasets naturally place all survivors in a zero-vote tie. Winners retain original indices and names, including multiplicity for duplicate names, and cases receive one blank separator.
