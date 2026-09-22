# Unwrap the expression from the inside out

## Problem and constraints

Expand a nested encoding into its first N terms, where 2 ≤ N ≤ 50. `[n]` is a constant sequence. `[m+S]` starts with m and then adds successive terms of S. `[m*S]` multiplies m by the first term of S immediately, then continues multiplying by successive terms.

The platform permits at most 20 cases per input, 200 characters and 20 bracket levels per encoding, and literal magnitudes at most 10⁹. An operator's preceding m is positive. Every nested subexpression's first N terms have at most 1,000 decimal digits, excluding a sign.

## Building the approach

An outer layer cannot be evaluated until its child sequence is known. Fortunately, each layer has only one child. Read inward while saving the outer `(m, operator)` pairs, reach the constant sequence, and then apply the saved layers in reverse order.

The main trap is that addition and multiplication use different starting indices. Addition produces `m, m+S₁, m+S₁+S₂, ...`: output m first, then use only the first N − 1 child terms. Multiplication produces `mS₁, mS₁S₂, ...`: multiply before outputting, using all N child terms.

Use exact integers and build a fresh list at each layer. Replacing child values while still needing them would mix two different sequence levels. Limiting every subexpression, rather than only the final output, also prevents enormous hidden intermediate values.

## Walkthrough

For `[2+[1]]`, the inner sequence is `1, 1, 1`, so the result is `2, 3, 4`. For `[2*[5+[-2]]]`, the inner additive layer begins `5, 3, 1, −1, −3, −5, −7`. Starting with multiplier two gives `10, 30, 30, −30, 90, −450, 3150`. The first result is ten, not two.

## Why it works

The initial list directly satisfies the constant encoding. Given a correct child list, the additive branch emits its specified initial value and then performs exactly its recurrence. The multiplicative branch's ith emitted value is m times the product of the first i child terms, also matching the definition. Applying layers from innermost to outermost proves the final list correct by induction.

## Complexity

For depth D and N terms, there are O(DN) integer operations; their cost depends on the operand lengths, bounded here by 1,000 decimal digits. Two lists and the saved layers need O(NB + D) space for maximum digit length B. Big-integer multiplication is not a constant-time operation.

## Common mistakes

- Printing m as the first multiplicative term.
- Adding S₁ before printing the first additive term.
- Evaluating the outer layer before its child.
- Using fixed-width integers or floating-point approximations.
- Checking only the final sequence's digit lengths.
