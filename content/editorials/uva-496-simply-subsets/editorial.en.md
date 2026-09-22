# Preserve line boundaries and compare actual set relations

## Problem and constraints

Every pair of input lines describes sets `A` and `B` of distinct integers. Classify them as equal, one a proper subset of the other, disjoint, or the remaining partially overlapping case. Input ends at EOF. On this platform an empty line is the empty set, and equality or proper-subset classifications take precedence over disjointness; therefore two empty sets are equal and an empty set is a proper subset of a nonempty set.

## Building the approach

Read by lines because each newline defines a set, and an empty line carries meaning. Convert the integers from each of two adjacent lines into sets. Input order is irrelevant and no sorting is needed.

Apply the relations in the required order: test equality, then `A` as a strict subset of `B`, then the reverse, then disjointness. If none applies, the sets share at least one element while each also has an element absent from the other, so the result is the confused case.

Size alone cannot prove any of these relations: equal-size sets may differ, and a smaller set need not be contained in the larger one.

## Walkthrough

For `A={1,2}` and `B={1,2,3}`, A is a proper subset. `A={1,2}` and `B={2,3}` intersect at 2 but neither contains the other, producing `I'm confused!`. Two empty lines represent equal empty sets. An empty A and `B={1}` use the proper-subset message before the disjoint test.

## Why it works

Equality and the two strict-containment directions are mutually exclusive and are tested directly from set membership. If none holds, disjointness precisely distinguishes zero intersection. Every remaining pair has a nonempty intersection and incomparable elements, which is exactly the final category. Reading exactly two complete lines per case prevents elements from different pairs from mixing and preserves empty sets.

## Complexity

For sets containing `M` and `N` integers, expected construction and relation-checking time is `O(M+N)` with hash sets, using `O(M+N)` set space. Python integers preserve arbitrary input magnitudes.

## Common mistakes

- Splitting the entire file into integers and losing line boundaries.
- Skipping empty lines and shifting every later pair.
- Comparing only set sizes or sums.
- Testing disjointness before empty-set equality or containment.
- Confusing strict subset comparison with numeric or lexicographic order.
