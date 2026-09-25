An inversion is a pair of indices `i<j` with `a[i]>a[j]`. Those two values appear in the wrong relative order and must reverse their order before the sequence is sorted.

An adjacent swap changes only the relative order of the two swapped elements; every other pair keeps the same order. Therefore one useful adjacent swap can remove only one inversion. Conversely, whenever the sequence is not sorted, it contains an adjacent inverted pair. Swapping such a pair removes exactly one inversion. Repeating reaches a sorted sequence after exactly as many swaps as the initial inversion count.

With at most 1000 values, simply inspect every pair `i<j` and count strict comparisons `a[i]>a[j]`. No actual sorting or more advanced data structure is required for this bound.

Store the potentially large inversion count in `long` and print the required phrase.
