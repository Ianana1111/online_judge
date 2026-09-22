# Maintain the interval consistent with every answer

## Problem and constraints

Stan is supposed to choose one fixed integer from one through ten. After each guess he says `too high`, `too low`, or `right on`; the last response ends the current game. Decide whether the claimed final value is consistent with all earlier responses. A zero guess terminates input. If the record has no contradiction, we may only say that Stan may be honest.

## Building the approach

Every response adds an inequality on the same hidden integer, and all feasible integers remain one interval. Start with `[low,high]=[1,10]`.

For `too high`, the answer is strictly below the guess, so set `high=min(high,guess-1)`. For `too low`, set `low=max(low,guess+1)`. The `min` and `max` are essential because later statements may be weaker than earlier restrictions and must not widen the feasible set.

On `right on`, the transcript is consistent exactly when the guessed value lies in the current interval. Reset the bounds only after reporting the completed game. Even if the interval becomes empty early, continue reading until `right on` so input remains aligned.

## Walkthrough

After guess five is `too low`, feasible answers are six through ten. Guess eight being `too high` reduces them to six or seven. A final `right on` at seven is consistent, while one at five contradicts the first statement.

If guess one is called `too high`, the interval immediately becomes empty. No later final answer can repair that contradiction, but the rest of the game's records still must be consumed.

## Why it works

Initially the interval contains exactly every legal answer. Each high or low update intersects it with the strict inequality expressed by the new response, preserving the invariant that the interval is precisely the integers consistent with all responses read so far.

`right on` claims equality with the final guess. Such a fixed answer satisfies the whole transcript if and only if it remains in that interval. Therefore the membership test produces exactly the required verdict.

## Complexity

Each guess takes `O(1)` time. A game of `Q` records takes `O(Q)` total time and `O(1)` extra space.

## Common mistakes

- Keeping the guess itself after a strict `too high` or `too low` response.
- Assigning a bound directly and allowing a later weak statement to widen it.
- Stopping input consumption as soon as the interval is empty.
- Accepting `right on` without checking earlier constraints.
- Forgetting to reset the interval for the next game.
