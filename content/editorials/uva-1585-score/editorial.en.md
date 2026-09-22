# Use the current correct-answer streak as each O's score

## Problem and constraints

A result string contains O for correct and X for wrong. A correct answer scores the length of the consecutive O run ending at that position; X scores zero and breaks the run. Strings have length below 80, and each test case is independent.

## Building the approach

Maintain `streak`, the number of consecutive O characters ending at the current position, and `total`. On O, increment streak first and add it to total. On X, reset only streak to zero while preserving accumulated points.

A run of length k contributes `1+2+...+k`; character-by-character accumulation computes the same sum without identifying runs explicitly.

## Walkthrough

`OOXXOXXOOO` has run lengths 2,1,3 and contributions 3,1,6, totaling 10. `OOXO` scores `1+2+0+1=4`; the final O restarts after X. A string of all X scores zero.

## Why it works

After each prefix, streak equals exactly its trailing O-run length. A new O extends that run by one, which is precisely its score, while X changes the trailing run to zero and scores nothing. Adding exactly each position's defined score makes the final total correct.

## Complexity

For length L, time is `O(L)` and extra space is `O(1)`.

## Common mistakes

- Adding the old streak before incrementing it.
- Carrying streak across X.
- Resetting total on X.
- Counting only the number of O characters.
- Reusing state across test cases.
