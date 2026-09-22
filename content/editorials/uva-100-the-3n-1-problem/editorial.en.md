# Reusing the tail of a 3n + 1 sequence

## Problem and constraints

Starting from a positive integer, halve an even value and replace an odd value by `3n + 1`. Stop at one. The cycle length counts **both the starting number and the final one**. For each pair of endpoints, report the largest cycle length anywhere in the inclusive interval, while printing the original endpoints in their original order.

The statement used on this platform limits endpoints to 1 through 9,999. Read pairs until EOF; there is no case count or zero sentinel. Intermediate sequence values need not stay inside the input interval, so the reference uses a 64-bit unsigned integer for them.

## Building the approach

Before trying to optimize an entire interval, solve a smaller task: can you count the sequence for one starting number? Follow the rule until reaching one and count the visited values. Once that works, try every start between the smaller and larger endpoint and keep the maximum. Looking only at the endpoints is not enough.

Now ask where work is repeated. Ten goes to five, and five goes to sixteen. If we already know the length starting at five, the length starting at ten is exactly one more. That observation gives us memoization; it is not necessary to find a closed formula for the sequence.

Set `memo[1] = 1`. For a new start, collect the unknown part of its path until reaching a cached value. Walk backward through that path, adding one at each step. Cache only values at most one million to keep memory bounded. Larger intermediate values are still processed; they are simply not used as array indices.

## Walkthrough

For ten, the path is `10 → 5 → 16 → 8 → 4 → 2 → 1`: seven values. Starting from the cached length of one, backward filling assigns lengths two to 2, three to 4, and eventually seven to 10.

For `1 10`, examine all ten starts; the maximum is 20, giving `1 10 20`. For `10 1`, the search is identical, but the answer must be printed as `10 1 20`. Search order and output order are separate concerns.

## Why it works

The base length for one is correct. Whenever a number takes one specified step to a value whose length is known, its own length is that length plus one. Applying this backward proves every filled length is correct. The outer loop visits every integer in the inclusive interval exactly once, so the maximum of those lengths is precisely the required answer.

## Complexity

For an interval of size R and longest encountered path length L, a conservative bound is O(RL) time. Memoization saves repeated tails but does not make arbitrary queries constant time. Space is O(B + L), with cache bound B = 1,000,000; the integer cache uses about 4 MB.

## Common mistakes

- Giving one a length of zero instead of one.
- Swapping the endpoints in the output, or skipping the final endpoint.
- Treating the cache limit as a bound on intermediate values.
- Reading only one pair instead of continuing until EOF.
- Evaluating an array access before checking whether its index is in range.
