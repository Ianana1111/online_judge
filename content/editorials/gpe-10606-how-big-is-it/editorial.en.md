# Fix a circle order, then push every circle as far left as possible

## Problem and constraints

Place 1 to 8 circles inside a box, each tangent to its bottom edge and with no overlapping interiors. Find the minimum width, printed to three decimal places. There are at most 50 cases. The platform bounds radii between 0.000001 and 10,000, with at most six fractional digits. The requested result is width, not rectangle area.

## Building the approach

A circle of radius r has center height r. For two circles, the center distance must be at least rᵢ + rⱼ, while their vertical separation is rᵢ − rⱼ. Pythagoras therefore requires horizontal separation at least `2√(rᵢrⱼ)`. Unequal circles can fit closer horizontally than the sum of their radii.

With only eight circles, enumerate the left-to-right center order. For a fixed order, place each new circle at the earliest feasible center: `xᵢ = max(rᵢ, maxⱼ<ᵢ(xⱼ + 2√(rᵢrⱼ)))`. The first bound keeps it inside the left wall; the others keep it clear of **all** earlier circles, not just its immediate neighbor. A tiny intervening circle may fail to separate two large ones.

Track the maximum right edge `xᵢ + rᵢ`, because an earlier large circle can extend farther than the last circle. This width never decreases as more circles are added, permitting pruning when a partial arrangement is already no better than the best complete one. Equal-radius swaps can also be skipped.

## Walkthrough

In the order 2, 1, 2, consecutive center separations are 2√2, giving width `4 + 4√2 ≈ 9.657`. Four radius-two circles need width 16. For radii 100 and 1, width 200 is enough: the small circle fits beside the lower part of the large circle without extending beyond its horizontal span.

## Why it works

Every feasible arrangement has some left-to-right center order. For that order, the first center is at least its own radius. Inductively, each later center must satisfy the wall bound and every earlier-circle bound. Taking their maximum attains the earliest feasible position. Moving an earlier center farther right cannot reduce any later lower bound, so this construction minimizes width for that order. Enumerating all orders yields the global minimum. Pruning only removes prefixes whose width can no longer improve the best result.

## Complexity

O(N! N²) worst-case time and O(N²) space for pairwise gaps, plus O(N) search state. Square roots are precomputed rather than repeated for every permutation.

## Common mistakes

- Checking only adjacent circles.
- Trying only one radius-sorted order.
- Using rᵢ + rⱼ as horizontal separation.
- Measuring only the last circle's right edge.
- Returning the diameter sum or the rectangle area.
