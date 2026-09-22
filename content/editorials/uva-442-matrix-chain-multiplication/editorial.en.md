# Collapse each completed parenthesized matrix product on a stack

## Problem and constraints

Up to 26 uppercase letters name matrices with known row and column counts. Every following expression is either one matrix or a fully parenthesized binary product. Compute the scalar multiplication count for the exact supplied parenthesization; do not optimize it. If any multiplication has incompatible dimensions, print `error` for the whole expression.

## Building the approach

Scan an expression from left to right. A matrix letter pushes its `(rows, columns)` dimensions, while an opening parenthesis needs no action. At every closing parenthesis, both enclosed subexpressions have already collapsed to dimensions at the stack top. Pop the right matrix first and the left matrix second.

If the left dimensions are `r x s` and the right are `s x c`, their multiplication costs `r*s*c` scalar operations and produces dimensions `r x c`. Add the cost and push that result. If the shared dimensions differ, remember that the expression is invalid. Continue consuming its syntax but never reset that failure flag, since an invalid inner product cannot be repaired by a compatible outer one.

A single matrix triggers no closing parenthesis and therefore costs zero. Exact integer arithmetic avoids imposing an unstated 32-bit cost limit.

## Walkthrough

Let `A` be `50 x 10`, `B` be `10 x 20`, and `C` be `20 x 5`. `((AB)C)` costs `50*10*20 = 10000`, then `50*20*5 = 5000`, totaling 15000. `(A(BC))` costs 1000 and then 2500, totaling 3500. Both yield the same dimensions, yet the required costs differ because the input parentheses differ.

## Why it works

Induct on expression structure. A single matrix pushes its correct dimensions at zero cost. At the closing parenthesis of a binary product, the induction hypothesis says both children have already contributed their complete costs and left their correct dimensions in stack order. The compatibility test, `r*s*c` cost, and `r x c` result are exactly the definition of matrix multiplication. Hence each subtree is collapsed correctly once, and any incompatible subtree correctly invalidates the entire expression.

## Complexity

For expression length `L`, every character is scanned once and every dimensions pair is pushed and popped a constant number of times, taking `O(L)` operations and `O(L)` stack space, aside from big-integer arithmetic cost.

## Common mistakes

- Solving matrix-chain optimization instead of following the input parentheses.
- Reversing the two popped operands.
- Counting `r*c` instead of `r*s*c`.
- Forgetting costs already accumulated inside child expressions.
- Clearing an inner incompatibility after an outer product happens to fit.
