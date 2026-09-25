Hamming cost separates by column. If a column chooses character c, exactly `m-count[c]` rows mismatch, so choose a maximum-frequency character independently in every column.

For ties, examine letters in lexicographic order A,C,G,T and update only for a strictly greater frequency. This preserves the earliest tied letter and therefore the lexicographically smallest complete optimum.

For each column choose the most frequent base, breaking ties A/C/G/T; all remaining entries add to the mismatch count.
