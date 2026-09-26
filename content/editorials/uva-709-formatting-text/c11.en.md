For a fixed line's words, only spacing remains. With g gaps and S spaces available, balanced gap sizes minimize squared penalties: q=S/g, r=S%g, using g−r gaps of q and r gaps of q+1. Put shorter gaps first to minimize their sequence.

cost[i] is the minimum penalty for words i through the paragraph end. Enumerate the first line's final word j, stopping when letters plus minimum separating spaces exceed width. Multiword penalty is Σ(gap−1)². A singleton has cost zero only when it fills the width, otherwise 500. The last line follows the same rule; ordinary ragged-last-line conventions do not apply.

Equal total penalties require a global comparison, not just the current line. Compare current-line gaps followed by the best suffix paragraph's gaps; the first smaller differing gap wins. C stores suffix byte sequences and compares them completely. Java/Python encode exact bit sequences into arbitrary-precision integers to reduce memory.

Encode gap g as g−1 ones followed by zero: 1→0, 2→10, 3→110. The first differing bit is zero for the smaller gap, preserving gap order. Append a one and pad shorter representations with ones during comparison, representing an end marker larger than every gap and preferring a longer common-prefix sequence. Track logical bit length because leading zero bits must retain meaning. This is exact encoding, not collision-prone hashing.

next/following records each chosen next-line start for reconstruction, preserving word order and the specified gaps and paragraph blank line. There are O(nW) candidate lines and O(nW) cost-DP work, plus full suffix-comparison costs. C suffix storage is O(n²) bytes in the worst case; integer versions compress gaps into bit strings and share suffix values for zero prefixes.
