# Double the reachable line capacity until it covers the target

## Problem and constraints

One `Hello World` line already exists. In one counted paste, copy any number of currently available lines and append one copy. Find the minimum pastes needed to reach exactly `N` lines. Copying is free, deletion is impossible, `1<=N<=10000`, and any negative integer terminates input.

## Building the approach

With `x` lines, one paste can add at most `x`, so the largest reachable count doubles. After `k` pastes, no strategy can exceed `2^k`; therefore the minimum `k` must satisfy `2^k>=N`.

Start `capacity=1` and repeatedly double it while below `N`. Capacity is an upper bound, not a requirement to overshoot in reality. On the final paste, if current count is `x<N<=2x`, copy exactly `N-x` lines, which is allowed. Thus the first sufficient capacity is attainable exactly.

## Walkthrough

For `N=7`, grow from 1 to 2 to 4, then copy only three of the four lines to reach 7: three pastes. `N=8` also needs three, while `N=9` needs four because three pastes can reach at most eight. `N=1` needs none.

## Why it works

Each paste at most doubles the current count, establishing that fewer than the reported number cannot reach `N`. Let the reported number be `k`. Complete doubling reaches `2^(k-1)` before the last step, and the remaining `N-2^(k-1)` lies between one and the current line count. Copying exactly that many lines reaches `N`, so the lower bound is achievable and optimal.

## Complexity

Each case takes `O(log N)` time and `O(1)` space.

## Common mistakes

- Taking floor of `log2 N` for a nonpower of two.
- Doubling while `capacity<=N` and overcounting exact powers of two.
- Counting the initial line as a paste.
- Assuming every paste must copy all current lines.
- Recognizing only `-1` rather than any negative terminator.
