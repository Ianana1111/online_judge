# Enumerate digit six, then pack the remaining prime factors

## Problem and constraints

Given `0 <= N <= 10^9`, find the smallest nonnegative decimal integer whose digits have product `N`, or print `-1` if none exists. Under this platform's stated convention, `N = 0` has answer `0` and `N = 1` has answer `1`.

## Building the approach

For positive integers, fewer digits always produce a smaller number than any candidate with more digits. Among equal-length candidates, sorting the same digits increasingly gives the smallest value. This suggests treating the prime factors of `N` as material that should be packed into as few decimal digits as possible.

Digits `2` through `9` contain only the primes `2, 3, 5, 7`. Remove those factors from `N`; if anything remains, no answer exists. The counts of digits `5` and `7` are forced. For factors two and three, larger digits pack several factors at once: `4 = 2^2`, `8 = 2^3`, and `9 = 3^2`. Only `6 = 2 * 3` mixes the two kinds.

Enumerate how many sixes are used. After fixing that count, pack the remaining twos into as many eights as possible plus one `2` or `4`, and pack the remaining threes into nines plus possibly one `3`. Add the forced fives and sevens, sort the digits, and keep the candidate with the shortest length and then the smallest lexicographic order.

## Walkthrough

For `N = 36 = 2^2 * 3^2`, using no six gives digits `4, 9`, or `49`. One six leaves a two and a three, producing `236`. Two sixes produce `66`. The three-digit candidate loses first, and `49 < 66`, so the answer is `49`.

For `N = 6`, one six gives the one-digit answer `6`, which is smaller than `23`. A value such as `11` leaves an unsupported prime factor and has no solution.

## Why it works

For `N > 1`, a minimum answer never uses `0` or `1`: zero destroys the product and one only adds a digit. Every usable digit contains only primes `2, 3, 5, 7`, so a remaining factor proves impossibility. Fives and sevens cannot be combined with other available prime factors except by making longer alternatives, so their digits are fixed.

Every valid answer contains some number of sixes, and the enumeration visits that number. Once it is fixed, twos and threes are independent. Pairing threes into nines always reduces the digit count. For twos, repeated exchanges reduce the representation to as many eights as possible and at most one residual `2` or `4`; replacing two fours by `2` and `8` also gives the smaller sorted number at equal length. Thus the construction is optimal for each six count. Sorting minimizes that digit multiset, and comparing every count yields the global minimum.

## Complexity

There are `O(log N)` possible counts of digit six. Each candidate contains `O(log N)` digits and is sorted, giving `O((log N)^2 log log N)` time with the direct implementation and `O(log N)` space. The answer is kept as a string, so its size is not limited by the input integer type.

## Common mistakes

- Printing `10` for `N = 0` despite this platform's explicit `Q = 0` convention.
- Adding digit `1`, which changes no product but makes the number longer.
- Forgetting to reject a prime factor other than `2, 3, 5, 7`.
- Trying only one count of digit `6` and missing values such as `6` or `49`.
- Comparing lexicographically before comparing lengths.
- Sorting the chosen digits in descending order.
