# Backtrack through nondecreasing divisors and finish with the remainder

## Problem and constraints

For each positive `N<=2000000`, list every factorization into at least two integers, each at least two. Permutations of the same factors are one answer. Print factors nondecreasing within each line, sort factor sequences numerically and lexicographically, and print the number of factorizations first. Zero terminates input; one and primes have no answer.

## Building the approach

Enforce nondecreasing factors during search to avoid generating permutations. The recursive state contains remaining product `rest`, minimum allowed next factor `minimum`, and the chosen path.

If a factorization will continue beyond the next factor, its smallest remaining factor cannot exceed `sqrt(rest)`. Enumerate every divisor from `minimum` through that inclusive boundary, append it, recurse on `rest/divisor` with the same value as the new lower bound, then backtrack.

At any state, another valid choice is to stop splitting and use the whole `rest` as the final factor. Record it only when the path is already nonempty and `rest>=minimum`; this enforces at least two factors and nondecreasing order.

Finally sort the vectors with numeric lexicographic comparison.

## Walkthrough

For 20, the results are `2 2 5`, `2 10`, and `4 5`. `5 4` is the same factor multiset and is excluded by order. `1 20` and the trivial single factor `20` are invalid.

For four, `2 2` must appear, so the divisor loop must include equality at the square root.

## Why it works

Every chosen divisor is at least two, divides the remaining product, and respects the lower bound, so recorded paths multiply to N and are nondecreasing.

For any valid nondecreasing factorization, its first factor d has at least one remaining factor no smaller than d, implying `d^2<=rest`; the loop necessarily considers it. Applying the same argument recursively follows the factorization until the final remainder is recorded. Thus no answer is missed. Nondecreasing order gives each factor multiset one unique sequence, so no duplicate is generated.

## Complexity

The search is output-sensitive; a conservative bound is `O((F+1)sqrt(N))` for `F` answers, with path depth at most `log2 N`. Stored output is `O(F log N)`, followed by lexicographic sorting.

## Common mistakes

- Restarting each recursion from two and generating permutations.
- Counting N alone as a factorization.
- Allowing factor one and causing endless recursion.
- Using a strict square-root bound and missing equal factor pairs.
- Sorting rendered strings, which puts 10 before 2 unlike numeric sequences.
