Represent a candidate reliable set by a bitmask. For each speaker, combine all positive targets into one mask and all negative targets into another. Only if the speaker is included as reliable must every positive target also be included and every negative target be excluded.

Enumerate all `2^n` masks and retain the maximum population passing these tests. A candidate no larger than the current best cannot improve it and may be skipped. Reaching `n` is globally optimal and permits early termination.

An unreliable informant may tell truth or lies, so only statements by selected reliable people constrain the set. Every positive target must be selected and every negative target excluded. Enumerate bitmasks and keep the largest valid set.
