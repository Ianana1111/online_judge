# Move an order-statistic boundary forward with two heaps

## Problem and constraints

Values from array `A` are added in order. The `p`-th GET must print the `p`-th smallest value among the prefix of length `u[p]`, where `u` is nondecreasing and `p <= u[p] <= M`. There are up to 30000 additions and queries. Equal values remain separate ranked elements.

## Building the approach

The requested rank increases by exactly one at every GET. Maintain a max-heap `lower` containing the already claimed smallest elements and a min-heap `upper` containing all remaining elements, with every `lower` value no greater than every `upper` value.

Before a query, add values until the required prefix length is present. If a new value is smaller than `lower.top()`, insert it into `lower` and move that heap's maximum to `upper`; this keeps `lower` at its old size while restoring the correct smallest set. Otherwise insert directly into `upper`.

For the GET itself, move `upper.top()`, the smallest remaining element, into `lower`. The new `lower.top()` is the requested next order statistic. Repeated values in `u` still perform separate GET operations even though no new value is added.

## Walkthrough

Add 3 and the first GET returns 3. Add 1; the second GET asks for the second smallest of `{1,3}`, again 3. After adding `-4,2,8,-1000`, two queries at the same six-element prefix can return the third and fourth smallest values, 1 and 2. Equal prefix sizes do not mean equal requested ranks.

## Why it works

After `p` GETs, inductively `lower` contains exactly the `p` smallest inserted elements and `upper` the rest. A new value below the boundary belongs in that smallest set; exchanging the largest member restores both membership and size. Any other new value belongs in `upper`. The next GET moves the least element outside the set across the boundary, expanding it to exactly the `p+1` smallest elements, whose maximum is the `(p+1)`-th smallest. Input guarantees that this element exists.

## Complexity

Each ADD or GET performs a constant number of heap operations, for `O((M+N) log M)` time. The two heaps together store `O(M)` values.

## Common mistakes

- Returning the global minimum on every GET instead of increasing the rank.
- Placing a new small value in `upper` without rebalancing.
- Using a set and discarding duplicate values.
- Skipping a GET when two `u` entries are equal.
- Making `upper` a max-heap and moving the wrong boundary element.
