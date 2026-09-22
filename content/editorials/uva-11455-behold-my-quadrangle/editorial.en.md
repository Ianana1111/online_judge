# Sort four sides and classify them in priority order

## Problem and constraints

Given four positive integer side lengths up to `2^30`, determine whether they can be arranged as a square, otherwise a rectangle, otherwise any nondegenerate quadrangle, or none (`banana`). We may choose their order and angles. The classification priority is part of the requirement.

## Building the approach

Sort the sides as `a<=b<=c<=d`. If `a==d`, all four are equal and can form a square. Otherwise, if `a==b` and `c==d`, two equal pairs can form a rectangle. Otherwise a nondegenerate quadrangle exists exactly when the longest side satisfies `d<a+b+c`.

The inequality must be strict: equality forces a collapsed straight line. Use 64-bit values before adding the three sides because their sum can exceed signed 32-bit range.

## Walkthrough

Sides `9,1,9,1` sort to `1,1,9,9` and form a rectangle. Four 29s must be reported as a square because that branch has priority. For `1,2,3,6`, the longest side equals the other three combined, so the result is banana. Replacing 6 with 5 gives a valid quadrangle.

## Why it works

Four equal lengths are necessary and sufficient to arrange a square. After excluding that case, two equal pairs are necessary and sufficient to arrange a rectangle. For positive lengths, a nondegenerate closed polygon exists exactly when no side is at least the sum of the others. Since sorting identifies `d` as the largest, checking only `d<a+b+c` implies the condition for every shorter side. The ordered branches therefore classify all inputs correctly.

## Complexity

Sorting four values and performing fixed comparisons take `O(1)` time and space.

## Common mistakes

- Testing rectangle before square and misclassifying four equal sides.
- Comparing only adjacent input positions without sorting.
- Accepting equality in the quadrangle inequality.
- Adding large sides in signed 32-bit arithmetic.
- Rejecting four equal sides because they could also form a rhombus.
