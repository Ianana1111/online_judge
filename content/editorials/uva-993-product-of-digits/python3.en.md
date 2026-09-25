For positive integers, fewer digits always produce a smaller number than any candidate with more digits. Among equal-length candidates, sorting the same digits increasingly gives the smallest value. This suggests treating the prime factors of `N` as material that should be packed into as few decimal digits as possible.

Digits `2` through `9` contain only the primes `2, 3, 5, 7`. Remove those factors from `N`; if anything remains, no answer exists. The counts of digits `5` and `7` are forced. For factors two and three, larger digits pack several factors at once: `4 = 2^2`, `8 = 2^3`, and `9 = 3^2`. Only `6 = 2 * 3` mixes the two kinds.

Enumerate how many sixes are used. After fixing that count, pack the remaining twos into as many eights as possible plus one `2` or `4`, and pack the remaining threes into nines plus possibly one `3`. Add the forced fives and sevens, sort the digits, and keep the candidate with the shortest length and then the smallest lexicographic order.

Factor N into 2, 3, 5, and 7, rejecting leftover factors. Enumerate how many digit sixes combine a 2 and a 3, pack the rest, then choose the shortest and lexicographically smallest candidate.
