The pair loops begin `j` at `i+1`, guaranteeing two distinct positions. Duplicate sum values remain in the array; they do not change the nearest numerical answer or binary-search correctness.

For each query, the lower-bound value initializes the answer. When no right candidate exists, `sums.back()` supplies the largest value. The predecessor is examined only if the iterator is not `begin`, avoiding an invalid step.

`llabs` compares distances in `long long`, which also protects pair addition and subtraction from unnecessary 32-bit narrowing. The case heading appears once, and every query sentence includes its required period.
