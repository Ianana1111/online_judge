# Count the net cost of each extra cola

## Problem and constraints

After drinking the `N` colas initially bought, we have `N` empty bottles. Three empties can be exchanged for one full cola, whose bottle becomes empty after drinking. Borrowing empties is allowed only if the debt can ultimately be repaid. The total must include the initial `N` drinks. Inputs from 1 through 200 continue until EOF.

## Building the approach

Instead of keeping borrowing states, track the net resource change. Exchanging three empties and receiving one back after drinking consumes two empty bottles for every extra cola. Starting with `N` empties therefore gives the upper bound `floor(N / 2)` extra drinks; borrowed bottles cannot improve this bound because they must be returned.

The bound is attainable. Perform normal exchanges while possible. If the final useful state has two empties, borrow one, exchange the three, drink the cola, and return the resulting one empty bottle. If only one remains, no further exchange can be repaid. Thus the total is exactly `N + floor(N / 2)`.

## Walkthrough

For `N = 8`, ordinary exchanges eventually leave two empties after 11 total drinks. Borrow one empty, make one last exchange, and return the empty obtained from that drink. The result is 12, equal to `8 + 8/2`.

For `N = 1`, borrowing two would leave only one bottle afterward, so the debt cannot be repaid and the answer remains 1. For `N = 2`, borrowing one enables one exchange and that same bottle can be returned, giving 3 drinks.

## Why it works

If `K` extra colas are obtained, each consumes two net empty bottles. After all debt is repaid, `N - 2K` empties remain, so `K` cannot exceed `floor(N/2)`. The exchange procedure above reaches this bound for both parity cases: it finishes normally when one remains, or uses a repayable final loan when two remain. Since the upper bound is achievable, the formula is optimal.

## Complexity

Each input requires one integer division and one addition, so time and extra space are both `O(1)`.

## Common mistakes

- Forbidding the final repayable loan and undercounting even values of `N`.
- Forgetting to include the initially purchased drinks.
- Counting borrowed empty bottles as drinks.
- Borrowing without checking that the final debt can be repaid.
- Rounding `N/2` upward for odd `N`.
