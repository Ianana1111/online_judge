After sorting, we need the boundary between values smaller than `x` and values at least `x`. `lower_bound` returns exactly the first position whose value is not less than `x`.

If that iterator is valid and its value equals `x`, no earlier position can contain `x`, so its index is the requested first occurrence. If it is the end, every marble is smaller. If it points to a larger value, all later values are also too large. In both latter cases, `x` is absent.

Do not remove duplicates: they affect the one-based ranks of every larger number.

Sort, then find the first element not less than the query; duplicates must report the leftmost position.
