# Follow the active forwarding chain and detect any repeated extension

## Problem and constraints

Each system has up to 100 forwarding rules consisting of a source extension, start time, duration, and target. A rule is active from `start` through `start + duration`, including both endpoints, and active intervals for one source do not overlap. For every call, find the extension that rings; an endless forwarding chain rings 9999. Rules end with source 0000 and calls end with time 9000.

## Building the approach

The call time stays fixed throughout forwarding. At that time, each extension therefore has either no active successor or one unique successor. Starting from the called extension, repeatedly scan the rules for the active rule whose source is the current extension.

If no rule exists, the current extension rings. Otherwise move to its target and continue. Record every visited extension for this call. Reaching any previously visited extension means the deterministic process will repeat the same suffix forever, so the answer is 9999.

Checking only whether we return to the original extension is insufficient: a chain such as `A -> B -> C -> B` enters a cycle that excludes `A`. A zero-duration rule is active at exactly its start time, so both interval comparisons require equality.

## Walkthrough

If A forwards to B from time 100 through 120, B forwards to C, and C forwards to B, a call to A at 100 or 120 reaches the B-C cycle and rings 9999. At 121, A's rule is inactive and A rings directly. A rule forwarding an extension to itself is detected on the second visit. With no rules, every original extension rings.

## Why it works

For a fixed call time, the rules define a partial function from extensions to extensions. Following that function exactly simulates every required forwarding hop. A vertex without a successor is precisely a ringing endpoint. If a vertex repeats, determinism makes all later steps repeat forever. Conversely, any infinite walk over finitely many extensions must repeat one, so the visited-set test detects every and only endless forwarding chains.

## Complexity

With `R <= 100` rules, one call visits at most `R + 1` distinct relevant extensions before stopping or repeating, and each step scans `R` rules, for `O(R^2)` time. Rules use `O(R)` space and the 10,000-entry visited array is fixed size.

## Common mistakes

- Excluding the final active time `start + duration`.
- Advancing the time at each forwarding hop.
- Detecting only a return to the original extension.
- Applying only one forwarding rule.
- Reusing visited state between calls or rules between systems.
