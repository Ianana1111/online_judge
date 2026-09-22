# Accumulate scores in round-major order and keep the latest tied player

## Problem and constraints

`J` players score in player order for each of `R` rounds, with both dimensions at most 500. Sum every player's scores and print the highest-scoring player's one-based ID. A tie is won by the last player to act, equivalently the largest ID. `0 0` terminates input.

## Building the approach

Read with rounds as the outer loop and players as the inner loop, adding each value to that player's total. The flat input is round-major, so reversing these loops would assign scores incorrectly.

Scan totals from small to large player ID. Replace the current winner when the new total is greater than or equal to the current best. Equality deliberately moves the winner to the later, larger ID.

## Walkthrough

For three players and two rounds with scores `1,2,3,4,3,2`, all totals equal five, so player 3 wins. Grouping every two consecutive values as one player's record would instead produce incorrect totals 3,7,5.

## Why it works

The nested input loops add every round's value to exactly the corresponding player. During the winner scan, after processing any prefix, the stored index has maximum total within that prefix and maximum ID among ties: a greater or equal new total replaces it, while a smaller one cannot win. Induction leaves the required global winner.

## Complexity

Time is `O(JR)` and storage is `O(J)`. Each total fits in an integer under the stated bounds.

## Common mistakes

- Using strict `>` and retaining an earlier tied player.
- Reading the data player-major rather than round-major.
- Keeping only the last round.
- Printing the zero-based vector index.
