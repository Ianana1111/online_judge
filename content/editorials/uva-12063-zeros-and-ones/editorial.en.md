# Count fixed-length binary prefixes by one bits and remainder

## Problem and constraints

Count positive exactly `N`-bit binary integers with no leading zero, equal numbers of zeros and ones, and divisibility by `K`. `1<=N<=64`, `0<=K<=100`. Odd `N` cannot balance bits. For `K=0`, no positive integer is a multiple of zero under this specification, so return zero before any modulo operation.

## Building the approach

For valid even `N`, require `N/2` ones. Fix the leading bit as 1. Let `dp[ones][remainder]` count current-length prefixes. Initialize `dp[1][1%K]=1`.

Appending bit zero changes remainder to `2r mod K`; appending one changes it to `(2r+1) mod K` and increments `ones`. Use a new layer for each length. After reaching exactly `N`, select `ones=N/2` and remainder zero. Never construct the 64-bit signed numeric value itself.

## Walkthrough

For `N=2,K=1`, only `10` qualifies; `01` has a leading zero. For `N=6,K=2`, a valid number ends in zero, begins in one, and chooses two additional ones among four middle positions, giving six. Counts near `N=64` exceed 32-bit range.

## Why it works

Initialization is exactly the set of legal one-bit prefixes. Every longer prefix uniquely consists of a shorter prefix and one final bit, and the two transitions implement binary value and one-count updates exactly. Induction proves every state count. At length `N`, having `N/2` ones also gives `N/2` zeros, and remainder zero is equivalent to divisibility for positive `K`, so the selected state satisfies all conditions.

## Complexity

There are `N` layers with `O(NK)` states, for `O(N^2K)` time and `O(NK)` rolling space.

## Common mistakes

- Allowing a leading zero.
- Taking modulo when `K=0`.
- Attempting balance for odd `N` with floor division.
- Updating a layer in place and appending several bits per round.
- Storing counts in 32 bits.
