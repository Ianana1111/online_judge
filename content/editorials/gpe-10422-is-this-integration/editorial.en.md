# Count how often each region is covered

## Problem and constraints

A square of side a contains four quarter-circles of radius a centered at its corners. Print, in order, the central striped area, the total of the four dotted regions, and the total of the four remaining edge regions. The side can be fractional, with 0 ≤ a ≤ 10,000. Read until EOF and print three decimal places.

## Building the approach

Directly tracing each curved boundary looks complicated. Instead, name the three unknown totals X, Y, and Z, and count the same areas in several easier ways. Let S = a². First, the regions partition the square, so `X + Y + Z = S`.

Next add the areas of all four quarter-circles. Their sum is πS. A point in the central region is counted four times, a dotted point three times, and an edge-region point twice. Hence `4X + 3Y + 2Z = πS`.

We need one more independent relation. The overlap of two circles centered at adjacent corners, restricted to the square, is half a symmetric lens. Two 60-degree sectors minus an equilateral triangle give `L = (π/3 − √3/4)S`. Summing the four adjacent-corner overlaps counts X four times, Y twice, and Z once: `4X + 2Y + Z = 4L`.

Solving gives `X = (1 − √3 + π/3)S`, `Y = (2√3 − 4 + π/3)S`, and `Z = (4 − √3 − 2π/3)S`. Integration is unnecessary; coverage counts turn the picture into linear equations.

## Walkthrough

For a = 0.1, S = 0.01. The three areas are approximately 0.003151467, 0.005112992, and 0.001735541. Print `0.003 0.005 0.002`. The exact areas add to S, although separately rounded outputs need not preserve that equality for every input.

## Why it works

Each equation counts the same geometric regions with their actual coverage multiplicities. The sector-and-triangle calculation gives the adjacent overlap exactly. The three independent equations uniquely determine the three unknown areas, so their solution equals the requested region totals. When a is zero, all formulas correctly give zero.

## Complexity

O(1) time and space per square. Retain floating-point precision until the final output formatting.

## Common mistakes

- Returning just one dotted region instead of all four.
- Swapping the required output order.
- Scaling by a instead of a².
- Rounding π, √3, or intermediate areas prematurely.
- Deriving the last area from already rounded printed values.
