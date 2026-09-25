When only adjacent cars may be swapped, count pairs whose relative order is wrong. A pair is an inversion if the left car has a larger number than the right one; sorting must reverse that pair. One adjacent swap changes only the swapped pair, so each inversion needs at least one operation. Conversely, repeatedly swapping adjacent inversions removes exactly one at a time, achieving that lower bound. With at most 50 cars, two loops can inspect every pair directly; an empty train has zero inversions.

Each case allocates exactly `n` positions and prints the required English sentence.
