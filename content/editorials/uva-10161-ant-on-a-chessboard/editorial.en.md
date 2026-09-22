# Locate the ant by square layer and parity

## Problem and constraints

An ant starts at coordinate `(1,1)` and follows the pictured square spiral path, advancing one cell per second. Given `1<=N<=2*10^9`, output its column coordinate x followed by row coordinate y at second N. Zero terminates input. Coordinate order matters.

## Building the approach

The path completes a square of side k exactly at time `k^2`. Find the smallest k with `k^2>=N`; then `(k-1)^2<N<=k^2`, so N lies on layer k. Integer binary search avoids floating square-root boundary errors.

Let `d=k^2-N`, the backward distance from the layer endpoint. First use the even-layer orientation, whose endpoint is `(k,1)`. If `d<k`, move along the right column to `(k,d+1)`. Otherwise move along the top row to `(2k-1-d,k)`. Odd layers are the diagonal reflection of even layers, so swap x and y when k is odd.

## Walkthrough

For N=8, k=3 and d=1. The even formula gives `(3,2)`; swapping for odd k produces `(2,3)`.

For N=20, k=5 and d=5. The second branch gives `(4,5)`, then swapping yields `(5,4)`. For square N=25, d is zero and the final coordinate is `(1,5)` after reflection.

## Why it works

Layer k adds one row and one column around the previous square, totaling `2k-1` positions numbered from `(k-1)^2+1` through `k^2`. The binary search therefore identifies the unique layer.

Counting backward from its endpoint, the first k positions lie on one outer edge and the remaining k-1 on the other; the two formulas list these disjoint ranges exactly. Odd-layer orientation is obtained by swapping coordinates, preserving position and turning points. Hence the computed coordinate matches time N.

## Complexity

Binary search takes `O(log sqrt(N))` time and `O(1)` space.

## Common mistakes

- Taking the floor square root and assigning nonsquares to the prior layer.
- Using the wrong inequality at the corner.
- Forgetting the odd-layer coordinate swap.
- Printing row before column.
- Starting positions from zero.
