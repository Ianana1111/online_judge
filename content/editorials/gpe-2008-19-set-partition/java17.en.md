Equal partition sums mean the chosen subset must sum to half the total. An odd total has no solution. Enumerating 2^N subsets is expensive at N=30, but each half has only about 15 elements.

Sort the values, split them, and enumerate each half's subset sums and masks. If a left subset sums to s, its right partner must sum to total/2−s. Sort right-half entries by sum and use binary search to find every matching mask, then combine the masks.

Different subsets may have the same sum, so retain all matches rather than one representative. A subset and its complement count separately; do not divide by two. The local specification limits total answer subsets to 10000, making answer storage and output manageable.

Sort answers by cardinality, then by their ascending value sequences. For equal-size masks over sorted values, the mask selecting the first differing smaller element comes first. `half` computes each sum from the mask with its lowest set bit removed. For H=2^⌈N/2⌉ and A answers, time is O(H log H + A log A·N), with O(H+AN) storage.
