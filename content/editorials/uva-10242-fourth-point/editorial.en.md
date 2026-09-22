# Find the repeated endpoint and add the two side vectors

## Problem and constraints

Each input line gives the two endpoints of one side of a parallelogram followed by the two endpoints of an adjacent side. The shared vertex therefore appears twice among the four points. Print the missing fourth vertex with exactly three digits after the decimal point. Coordinates range from -10000 to 10000 meters and are given to millimeter precision. Input continues until end of file, and the common endpoint may occupy any endpoint position on either side.

## Building the approach

This does not require slopes or line intersections. Let the shared endpoint be `P` and the two other endpoints be `A` and `B`. The side vectors leaving `P` are `A-P` and `B-P`, so the opposite vertex is

`D = P + (A-P) + (B-P) = A+B-P`.

The sum of all four input points is `A+B+2P`, because `P` appears twice. Once the matching endpoint is found, subtracting `3P` from that total yields `A+B-P`, the desired point.

All coordinates have at most three decimal digits. Convert them to integer millimeters before doing the additions and subtractions. The answer remains an exact integer number of millimeters, avoiding floating-point output artifacts such as negative zero.

## Walkthrough

Suppose the repeated point is `P=(0,1)`, while the other endpoints are `A=(0,0)` and `B=(1,1)`. Then

`D=A+B-P=(1,0)`,

so the output is `1.000 0.000`.

If `P=(3.5,3.5)`, `A=(1,0)`, and `B=(0,1)`, the same formula gives `(-2.5,-2.5)`. The fourth vertex can be negative and need not lie inside the region suggested by the other three plotted points.

## Why it works

The two adjacent side vectors are exactly `A-P` and `B-P`. Opposite sides of a parallelogram are equal and parallel, so moving from `A` by vector `B-P` reaches the unique fourth vertex. Its coordinate is `A+B-P`.

The program compares endpoints across the two supplied sides and therefore identifies the repeated point `P`. The total of all input coordinates counts `P` twice; subtracting three copies leaves `A+B-P`. Scaling all coordinates by 1000 preserves vector addition, so converting the exact integer result back to three decimal places gives the correct answer.

## Complexity

There are always four points and at most four cross-side comparisons. Each case takes `O(1)` time and `O(1)` extra space.

## Common mistakes

- Assuming the common point always appears at fixed positions in the input.
- Subtracting only two copies of the common point from the four-point sum.
- Introducing unnecessary slope calculations and special cases for vertical lines.
- Doing all arithmetic in binary floating point and printing `-0.000`.
- Failing to pad every coordinate to exactly three decimal digits.
