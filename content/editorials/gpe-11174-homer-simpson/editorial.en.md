# Minimize idle time first, then maximize burgers

## Problem and constraints

Homer has two burger choices taking `M` and `N` minutes. During `T` minutes he may eat any number of either type. The priorities matter: first minimize the minutes left for beer, and only among plans with the same unused time maximize the number of burgers. All three values are between 1 and 9999. Print only the burger count when no time remains; otherwise print the count and the unused time.

## Building the approach

It is tempting to maximize the burger count directly, but that reverses the problem's priorities. Ask a different question: for every exact amount of used time, what is the largest burger count that can achieve it?

Let `best[time]` be that count, and use `-1` for an unreachable time. The empty plan gives `best[0] = 0`. Any nonempty plan ending at `time` must take either an `M`-minute burger after a plan for `time-M`, or an `N`-minute burger after a plan for `time-N`. We extend only reachable states and keep the larger count.

After filling the table, scan downward from `T` to find the greatest reachable `used`. This minimizes `T-used`. The value already stored at that time resolves the second priority.

## Walkthrough

For `M=3, N=10, T=10`, three short burgers use nine minutes, but one long burger uses all ten. Zero unused minutes wins, so the answer is `1`, not `3 1`.

For `M=3, N=5, T=7`, six minutes are reachable with two short burgers while seven is not. We print `2 1`. If both burger times exceed `T`, the scan eventually reaches `best[0]`, so the result is `0 T`.

## Why it works

We prove by increasing `time` that `best[time]` is the maximum count among plans using exactly that many minutes. The claim is true at zero. Every nonempty plan for `time` has a final burger of duration `M` or `N`; removing it produces a plan represented by the corresponding earlier state. Conversely, extending either reachable earlier state produces a valid plan. Taking the maximum therefore considers every valid plan and chooses the best count.

The downward scan selects the largest reachable used time, which is exactly the smallest leftover time. Within it, `best` supplies the maximum burger count. Thus both priorities are satisfied in their required order.

## Complexity

Each time value performs two constant-size transitions. The running time is `O(T)` and the extra space is `O(T)`.

## Common mistakes

- Maximizing burger count before minimizing unused time.
- Using zero for unreachable states and accidentally extending a nonexistent plan.
- Treating each burger type as usable only once.
- Forgetting that `best[0]` is a valid stopping point.
- Printing a second number when the unused time is zero.
