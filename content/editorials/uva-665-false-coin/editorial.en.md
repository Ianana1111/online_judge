# Test every coin under both light and heavy hypotheses

## Problem and constraints

Exactly one of up to 100 coins differs in weight, but it may be lighter or heavier. Up to 100 equal-pan weighings record `<`, `>`, or `=`. Output the uniquely determined counterfeit coin id, or zero when the compatible id set does not contain exactly one coin. This platform also defines contradictory records with no compatible hypothesis to produce zero; a single id remains identifiable even when both its light and heavy directions are possible.

## Building the approach

Enumerate every pair `(coin,direction)`, where direction is `-1` for light and `+1` for heavy. For one weighing, encode the candidate's placement as `+1` on the left, `-1` on the right, and zero when absent. Encode the observed left-minus-right result as `-1`, `+1`, or zero. Because all genuine baseline weights cancel between equal-size pans, the hypothesis predicts exactly `side * direction`.

Reject a hypothesis if any weighing disagrees. A coin id is a candidate when at least one of its two directions survives. Count ids, not surviving directions: an unweighed sole unknown coin may be light or heavy but still has a unique id. Output that id only when exactly one candidate id remains.

## Walkthrough

With three coins, a balanced weighing of coins 1 and 2 proves both genuine, leaving coin 3 as the unique id although its direction is unknown. If coin 1 and coin 2 balance with the left lighter, either the left coin is light or the right is heavy, so output is zero. Identical placements reported once left-light and once right-light admit no hypothesis and also produce zero.

## Why it works

Every possible truth is exactly one of the `2N` id-and-direction hypotheses. Equal genuine weights cancel, so the sign formula predicts each recorded weighing exactly under that hypothesis. A hypothesis survives all comparisons if and only if it is consistent with all evidence. Grouping surviving hypotheses by coin therefore yields precisely the possible counterfeit ids, and a unique id is identifiable exactly when that set has size one.

## Complexity

Testing two directions for `N` coins across `K` weighings takes `O(NK)` time. The placement matrix uses `O(NK)` space.

## Common mistakes

- Considering only a heavy counterfeit.
- Counting light and heavy hypotheses as different coin ids.
- Failing to exclude weighed coins after a balanced result.
- Looking at only one unbalanced weighing.
- Returning an arbitrary coin when the records are inconsistent.
