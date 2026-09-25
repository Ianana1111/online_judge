Count occurrences in a 26-entry array. Scan only positive counts, incrementing the number of distinct letters and inserting each frequency into a set. A failed insertion means two appearing letters share a frequency. Accept only when at least two letters appeared and every insertion was unique.

Zero frequencies must be ignored: absent letters do not participate in the definition. The separate distinct-letter condition prevents a one-letter word from passing vacuously.

Count each distinct letter; a cool word needs at least two letters and pairwise distinct nonzero frequencies.
