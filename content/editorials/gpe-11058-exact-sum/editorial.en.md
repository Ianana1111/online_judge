# Move inward until the exact-price pair is as balanced as possible

## Problem and constraints

Choose two different books whose prices sum exactly to M. Among valid pairs, minimize their price difference. There are 2 to 10,000 books, each priced at most one million, and at least one valid pair is guaranteed. Equal prices are allowed if two separate books exist. Read cases until EOF and print the required sentence followed by a blank line.

## Building the approach

Sort the prices and put pointers at the smallest and largest. If their sum is below M, keeping the current small price while decreasing the other price cannot help, so discard the left endpoint. If the sum is above M, keeping the large price while increasing the other cannot help, so discard the right endpoint.

When the sum equals M, save the pair and move both pointers inward. Do not stop at the first match. With a fixed total, a larger low price and smaller high price make the difference no larger, so later exact matches improve or tie the saved pair.

Require `left < right`, ensuring two different books. Sorting must retain duplicate entries; deduplicating prices would lose valid equal-price pairs.

## Walkthrough

For prices `1,2,4,6,8,9` and M = 10, the scan can find `(1,9)`, then `(2,8)`, then `(4,6)`. The last has the smallest difference, two. For `1,4,5,9` with the same total, only `(1,9)` works: there is just one price-five book, so `(5,5)` is unavailable. Two actual price-40 books can correctly form a total of 80.

## Why it works

For a sum below the target, no remaining partner for the current left endpoint can reach it; the symmetric argument justifies discarding a too-large right endpoint. At an exact match, reusing either endpoint can only match the same partner price, giving no smaller difference, so both may advance. Every potentially better pair remains inside the current interval. Exact matches have nondecreasing lower prices and nonincreasing upper prices, making the final saved pair optimal.

## Complexity

O(N log N) sorting and O(N) scanning, with O(N) price storage. Every pointer move removes at least one candidate position.

## Common mistakes

- Stopping at the first exact sum.
- Allowing equal pointer indices and buying one book twice.
- Removing duplicate prices.
- Choosing a near-half price without checking its partner exists.
- Omitting the blank line after each answer.
