# Descend through Fibonacci-string lengths without building the string

## Problem and constraints

`F(0)="0"`, `F(1)="1"`, and `F(n)=F(n-2)+F(n-1)` in that order. Output the inclusive substring from index `i` through `j`. Indices and `n` may reach `2^31-1`, while output length is at most 10,001, making full construction impossible.

## Building the approach

To locate one character in finite level `n`, the left segment is `F(n-2)` with known length. If position is below that split, descend to `n-2`; otherwise subtract the split and descend to `n-1`. Base levels directly return 0 or 1. Repeat independently for requested positions.

For huge levels, `length(46)=2,971,215,073`, already beyond every valid query index. Whenever `n>=48`, the full query lies in the leading `F(n-2)`, so reducing by two preserves it. Jump directly by parity to 46 or 47; odd and even levels must remain distinct. Store lengths through 47 in 64 bits.

## Walkthrough

`F(2)=01`, `F(3)=101`, and `F(4)=01101`. Querying positions 1 through 2 of `F(3)` skips its first `F(1)` character and reads `F(2)`, producing `01`. Very large even levels share the relevant prefix with `F(46)`, while odd ones share it with `F(47)`.

## Why it works

The two concatenated segments partition every Fibonacci string. Choosing the containing segment and adjusting only a right-segment index preserves the target character until a base case. For `n>=48`, the leading segment length exceeds the query's largest index, so reducing `n` by two preserves the whole requested interval. Repetition reaches the parity-matching 46 or 47. Concatenating exact results for every requested index yields precisely the inclusive substring.

## Complexity

For output length `Q<=10001`, each character descends at most 47 levels, giving `O(47Q)` time and `O(Q)` output space.

## Common mistakes

- Reversing concatenation order.
- Decrementing a billion-size level one pair at a time.
- Collapsing odd and even large levels together.
- Storing length 47 in 32 bits.
- Treating the right endpoint as exclusive.
