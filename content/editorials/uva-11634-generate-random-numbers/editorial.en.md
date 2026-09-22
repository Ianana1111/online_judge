# Mark four-digit states until the deterministic sequence repeats

## Problem and constraints

Starting from an integer from 1 through 9999, square it as an eight-digit zero-padded decimal value and take the middle four digits as the next state. Count all distinct states, including the initial one. A zero input terminates cases, but a zero generated inside a sequence is a normal state and must count.

## Building the approach

Every state lies from 0 through 9999, so use a Boolean array of size 10,000. While the current state is unseen, mark and count it, then generate the next state. Stop at the first previously seen value.

The middle four digits can be extracted arithmetically: divide the square by 100 to drop its final two digits, then take modulo 10,000 to retain the next four. Conceptual leading zeros do not affect this expression.

## Walkthrough

`1111^2=01234321`, whose middle digits are 2343; integer extraction gives 12343 and then 2343. Starting from 1 produces `1,0,0,...`, so two distinct states occur. Starting from 100 gives square `00010000` and returns to 100 immediately, so the count is one.

## Why it works

The seen array records exactly the states already counted, so each loop iteration contributes one new distinct value. Because the transition is deterministic, revisiting a state means every future value repeats the earlier suffix and no new state can ever appear. Stopping at the first repetition therefore counts precisely the distinct values in the infinite sequence.

## Complexity

For `K` visited states, transitions take `O(K)` time after `O(10000)` zero initialization and use `O(10000)` space. Always `K<=10000`.

## Common mistakes

- Omitting the initial state.
- Treating a generated zero as the input sentinel.
- Extracting the wrong four digits.
- Stopping only at zero instead of any cycle.
- Reusing seen states between test cases.
