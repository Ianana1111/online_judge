# Count exact positions first, then match digit multiplicities

## Problem and constraints

A secret and every guess are sequences of `N <= 1000` digits from 1 through 9, with repetition allowed. A strong match has the same value in the same position. A weak match has the same value elsewhere, and no position may be matched more than once. An all-zero guess ends one game, and `N = 0` ends the input.

## Building the approach

Strong matches have no ambiguity, so count them by comparing corresponding positions. To count every match without reusing duplicates, count how often each digit occurs in the secret and guess.

For digit `d`, at most `min(secretCount[d], guessCount[d])` copies can be paired, and that many pairs are always attainable because their precise positions do not matter for the total. Summing this minimum over digits 1 through 9 gives `total`, which includes both strong and weak matches. Therefore `weak = total - strong`.

Keeping a strong pair never reduces the maximum total: it removes one identical value from both sides, exactly decreasing the possible count for that digit by one. This also explains why subtracting the strong count leaves the maximum number of valid off-position matches.

## Walkthrough

For secret `1 1 2 3` and guess `1 2 1 1`, the first position is the only strong match. Across all positions, two copies of digit 1 and one copy of digit 2 can be paired, so `total = 3` and `weak = 2`. The guess's third copy of 1 has no unused secret copy and cannot score again.

## Why it works

For each digit, the smaller multiplicity is both an upper bound and an achievable number of pairs. Different digits never compete for a position, so adding these values yields the maximum total number of matches. All equal-position pairs are included in this total and can be fixed first without harming attainability. After removing them, no remaining equal-position pair exists, so every remaining attainable pair is weak. Thus the reported strong and weak counts satisfy the rules and are maximal.

## Complexity

Each guess takes `O(N + 9)` time and `O(N)` space for the stored guess. The two digit-count arrays use constant space; the secret counts are reused throughout one game.

## Common mistakes

- Scoring every guessed copy merely because that digit appears somewhere in the secret.
- Reporting `total` as the weak count without subtracting strong matches.
- Stopping after the first zero instead of reading the full terminating guess.
- Failing to reset guess counts or increment the game number.
- Printing the wrong indentation, parentheses, or comma format.
