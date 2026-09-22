# Classify the box containing the last labeled marble

## Problem and constraints

Distribute N distinct marbles among K labeled boxes, with at least X marbles in every box. Count assignments modulo 1,000,000,007. There are at most 50 cases, N ≤ 100,000, K ≤ 50, and 1 ≤ X ≤ N. This is neither an identical-object stars-and-bars problem nor the unrelated same-named linear-equation problem.

## Building the approach

Let f(n,k) count assignments to k boxes. Instead of deciding every box size at once, inspect the box containing marble n.

If that box has more than X marbles, remove marble n. The remainder is a valid assignment of n − 1 marbles to k boxes, and marble n can be restored to any of the k boxes. This contributes `k f(n−1,k)`.

If its box has exactly X marbles, choose that box in k ways and choose its X − 1 companions from the other n − 1 marbles. The remaining marbles must fill the other k − 1 boxes, contributing `k C(n−1,X−1) f(n−X,k−1)`. Hence `f(n,k) = k[f(n−1,k) + C(n−1,X−1)f(n−X,k−1)]`, with `f(0,0)=1`.

Compute by increasing box count, then increasing marble count. Only the previous and current box-count rows are needed. Precomputed factorials and inverse factorials answer combinations quickly. Skip n < kX and leave at least X marbles for every box not yet processed.

For X = 1, use the faster surjection formula `Σⱼ (−1)ʲ C(K,j)(K−j)^N`, excluding empty boxes by inclusion-exclusion. For other cases sharing K and X, compute one table through their largest N and reuse its final row.

## Walkthrough

For N = 4, K = 2, X = 2, the last marble's box must contain exactly two. Choose its box in two ways and its companion in three ways; the other two marbles fill the other box. The answer is six. For N = 10, K = 5, X = 3, the required minimum is 15 marbles, so the answer is immediately zero.

## Why it works

The last marble's box has either exactly X or more than X elements, making the two cases disjoint and exhaustive. Removing the last marble in the second case, or removing its whole box in the first, yields the counted smaller assignment uniquely. Each construction is reversible, so the recurrence neither duplicates nor omits assignments. Its dependencies use fewer marbles or fewer boxes, matching the evaluation order. The X = 1 inclusion-exclusion branch counts the same assignments by removing those with at least one empty box.

## Complexity

Factorial preprocessing takes O(U + log MOD) time and O(U) space for U = 100,000. Each general (K,X) group takes O(KNmax) time and O(Nmax) extra space. An X = 1 query takes O(K log N) time. Reduce intermediate products modulo MOD.

## Common mistakes

- Treating marbles as indistinguishable or boxes as unlabeled.
- Replacing at least X with exactly X.
- Choosing C(n,X) even though the last marble is already fixed.
- Overwriting the previous box-count row before it is used.
- Enumerating all Kᴺ assignments.
