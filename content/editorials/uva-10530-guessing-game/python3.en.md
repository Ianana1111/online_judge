Every response adds an inequality on the same hidden integer, and all feasible integers remain one interval. Start with `[low,high]=[1,10]`.

For `too high`, the answer is strictly below the guess, so set `high=min(high,guess-1)`. For `too low`, set `low=max(low,guess+1)`. The `min` and `max` are essential because later statements may be weaker than earlier restrictions and must not widen the feasible set.

On `right on`, the transcript is consistent exactly when the guessed value lies in the current interval. Reset the bounds only after reporting the completed game. Even if the interval becomes empty early, continue reading until `right on` so input remains aligned.

`low` and `high` bound the remaining closed interval; inconsistent hints place the final guess outside it.
