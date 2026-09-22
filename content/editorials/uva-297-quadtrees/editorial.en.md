# Paint both quadtrees into one bitmap to obtain their union

## Problem and constraints

Two preorder quadtrees describe 32-by-32 black-white images. `f` is a fully black region, `e` fully white, and `p` has four children in the specified quadrant order, with depth at most five. Count black pixels in the union, counting overlap once.

## Building the approach

Start a white 32-by-32 boolean bitmap. Recursively parse a tree while carrying region top-left and side length. For `f`, set every pixel in the region true; for `e`, do nothing; for `p`, halve the side and parse exactly four quadrants in the prescribed order.

Paint both trees into the same bitmap. Setting true is idempotent, so overlap naturally counts once. A white leaf must never clear black from the other image, and every subtree must still be consumed even when an area is already black.

## Walkthrough

Two full-black trees still produce 1,024 pixels, not 2,048. Two white trees produce zero. Distinct black quadrants produce 512, while matching black quadrants remain 256.

## Why it works

By recursion, f marks exactly its entire region, e adds none, and p partitions its region into four disjoint complete quadrants whose recursive markings reproduce the image. Applying both parsers with only false-to-true changes leaves a pixel true exactly when either image is black there. Counting bitmap entries therefore gives union area without duplication.

## Complexity

Time is `O(total tree length+1024)` plus at most 1,024 pixel writes per image; bitmap space is fixed `O(1024)` and recursion depth at most five.

## Common mistakes

- Adding separate black counts and double-counting overlap.
- Letting second-image white clear prior black.
- Using inconsistent quadrant order.
- Consuming fewer than four p children.
- Skipping parsing merely because a region is already black.
