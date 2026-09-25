A sequence of 1-quotations contains any positive even number of quotes, but one single 1-quotation has exactly two. For `k>=2`, concatenated k-quotations can be reparsed as one, so test by peeling k quotes from both ends, then k-1, down through two. The remaining content must contain a positive even number of quotes.

Operate directly on run lengths. End pointers may skip only exhausted runs; one layer cannot cross ordinary text. If both ends lie in one run, require twice the layer count. Try k downward from the first/last run bound, also requiring at least `k(k+1)` total quotes.

The total quote count must be even. For a candidate outer level k, peel k, k−1, …, 2 quotes from the leftmost and rightmost remaining runs; at least two quotes must remain for the inner level.
