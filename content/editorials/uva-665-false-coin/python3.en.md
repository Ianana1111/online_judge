Enumerate every pair `(coin,direction)`, where direction is `-1` for light and `+1` for heavy. For one weighing, encode the candidate's placement as `+1` on the left, `-1` on the right, and zero when absent. Encode the observed left-minus-right result as `-1`, `+1`, or zero. Because all genuine baseline weights cancel between equal-size pans, the hypothesis predicts exactly `side * direction`.

Reject a hypothesis if any weighing disagrees. A coin id is a candidate when at least one of its two directions survives. Count ids, not surviving directions: an unweighed sole unknown coin may be light or heavy but still has a unique id. Output that id only when exactly one candidate id remains.

Try each coin as lighter or heavier and check every weighing result. Count distinct feasible coin numbers, not feasible directions; a coin consistent in both directions is still one candidate.
