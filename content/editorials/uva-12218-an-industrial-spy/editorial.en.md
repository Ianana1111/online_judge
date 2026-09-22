# Enumerate unique digit strings by remaining multiplicities

## Problem and constraints

Each case contains one through seven digit fragments. We may choose any nonempty subset, arrange it, and ask how many distinct prime values can be formed. Equal fragments may repeat, but each physical fragment is used at most once. Representations differing only by leading zeroes are the same number. There are up to 200 cases.

## Building the approach

All possible values are below ten million, so build one sieve for `[0,10^7)` before processing cases. For one case, store how many copies of each digit remain. DFS keeps the current value and used length; every visited nonempty prefix is a candidate, because unused fragments may be ignored.

Branch once per digit value with positive remaining count, decrement before recursion, and restore afterward. Disallow zero as the first digit. This frequency-based search avoids duplicate branches from interchangeable copies, while the no-leading-zero rule gives each numeric value its unique ordinary decimal representation.

## Walkthrough

With fragments `1` and `7`, the search counts `7`, `17`, and `71`; requiring all fragments would miss `7`. With `011`, the prime values include `11` and `101`. The spellings `011` and `11` must not count separately, and the canonical no-leading-zero search generates only the latter.

## Why it works

Every DFS step consumes one available fragment, so generated strings never exceed the inventory. Conversely, the unique ordinary decimal representation of every constructible positive integer can be followed digit by digit in the search, because it uses no leading zero and respects the same counts. Branching by digit value makes that path unique even for repeated fragments. The sieve then accepts exactly the prime generated values, so the final count has neither omissions nor duplicates.

## Complexity

The shared sieve costs `O(B log log B)` time and `O(B)` bits for `B=10,000,000`. With seven distinct fragments, one case explores at most `sum P(7,k)=13,699` nonempty prefixes, with recursion depth at most seven and `O(1)` inventory space.

## Common mistakes

- Testing only arrangements that use every fragment.
- Permuting fragment indices and counting equal digits repeatedly.
- Counting leading-zero spellings as different numbers.
- Treating one as prime.
- Forgetting to restore a digit count after recursion.
