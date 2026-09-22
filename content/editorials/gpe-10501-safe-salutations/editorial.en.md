# One handshake separates two independent circles of choices

## Problem and constraints

There are 2N people around a circle. Pair everyone so that each person participates in exactly one handshake and no two handshake segments cross. Count the complete pairings. N is the number of pairs, with 1 ≤ N ≤ 10. Read until EOF and separate answers with a blank line.

## Building the approach

Counting all perfect matchings would include crossing handshakes. Instead, fix the first person and consider their partner. Their handshake is a chord that divides the remaining people into two groups. No other handshake may cross that chord, so each group must pair internally.

Both groups need an even number of people. If one side contains k pairs, the other contains N − 1 − k pairs. The choices on the two sides are independent, so they contribute `ways[k] * ways[N − 1 − k]` possibilities. Add this product for every k from zero through N − 1.

This gives the Catalan recurrence. The important base is `ways[0] = 1`: an empty side has one valid completion, requiring no further handshakes. It must not multiply the other side's choices by zero.

## Walkthrough

With one pair there is one handshake. With two pairs, the first person can pair with either neighboring person; pairing across the circle would force the remaining handshake to cross. Thus there are two solutions. For three pairs, the three possible splits give `1×2 + 1×1 + 2×1 = 5`.

## Why it works

Every valid pairing has one unique partner for the first person and therefore one unique split into two sides. The remaining handshakes form valid pairings on those sides. Conversely, any two valid side pairings can be combined with the chosen chord without a crossing. Multiplication counts independent side choices and addition combines disjoint partner choices, counting each complete pairing exactly once.

## Complexity

Precomputing through N takes O(N²) time and O(N) space. Each query is O(1). At N = 10 the answer is 16,796.

## Common mistakes

- Treating N as the number of people instead of pairs.
- Counting all perfect matchings without excluding crossings.
- Adding the side counts instead of multiplying them.
- Giving an empty side zero completions.
- Omitting the blank lines between outputs.
