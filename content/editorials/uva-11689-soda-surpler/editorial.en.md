# Exchange bottles in batches and recycle the new empties

## Problem and constraints

Start with `e` empty bottles and find `f` more. Every `c` empties may be exchanged for one full soda, and drinking it returns one empty bottle. Count newly obtained sodas. There is no borrowing rule. Values are below 2,000 and `c>1`.

## Building the approach

Set `empty=e+f`. While at least `c` empties remain, exchange `drinks=floor(empty/c)` bottles in one batch and add that number to the answer. The next empty count is the unspent remainder `empty%c` plus one returned empty for each newly consumed soda: `empty%c+drinks`.

The initial bottles are already empty and are not drinks obtained today, so the answer begins at zero. When fewer than `c` remain, no legal action exists.

## Walkthrough

With `e=9,f=0,c=3`, exchange three sodas, drink them, and retain three empties. Exchange once more and finish with one empty, for four sodas total. Starting with no empties gives zero. Two empties cannot be turned into a soda when three are required because borrowing is forbidden.

## Why it works

Each batch exchanges every complete group currently available. Its remainder is exactly the old bottles not spent, and every obtained drink contributes exactly one new empty, so the update preserves the full state. Performing an available exchange reduces net empties by `c-1` and cannot make a better future exchange impossible. When the loop ends, no exchange is legal, so all obtainable drinks have been counted.

## Complexity

The state strictly decreases because `c>=2`; time is at most `O(e+f)` and space is `O(1)`.

## Common mistakes

- Stopping after one exchange round.
- Counting initial empties as consumed sodas.
- Using `>` instead of `>=` at the exact threshold.
- Borrowing a bottle under rules from another problem.
- Dropping the unused remainder in the state update.
