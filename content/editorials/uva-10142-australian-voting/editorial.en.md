# Recount transferable ballots after simultaneous elimination

## Problem and constraints

Up to 20 candidates receive as many as 1,000 complete ranked ballots. In each round, a ballot counts for its highest-ranked candidate still alive. A candidate with strictly more than half of all ballots wins. Otherwise, every candidate tied for the lowest vote count is eliminated simultaneously and ballots transfer. If all remaining candidates tie, all are winners. Print original full names and separate datasets by a blank line.

## Building the approach

Keep an `alive` flag for every candidate and preserve every ballot's original ranking. At the start of each round, clear vote counts. For each ballot, scan its ranking until the first alive candidate, give exactly one vote, and stop.

Find minimum and maximum votes among alive candidates only. First test strict majority with `2*most > ballotCount`. If it fails and minimum equals maximum, every survivor ties and wins. Otherwise mark all candidates at the minimum dead at once, then start a fresh recount.

Simultaneous elimination is essential. Removing one tied-low candidate and recounting immediately could transfer ballots to another candidate who should have been eliminated in the same round.

## Walkthrough

With six ballots split A=3, B=2, C=1 and C voters preferring B next, A has exactly half and does not win. After eliminating C, A and B each have three, so both are winners.

If first choices are A=2, B=1, C=1, both B and C are lowest and must be removed together; neither may receive the other's transferred ballot first.

## Why it works

Every round assigns each ballot to precisely its highest-ranked alive candidate, matching the voting rule. Minimum and maximum ignore eliminated candidates, so old zero counts cannot affect decisions.

The majority test recognizes exactly the strict winning condition. Equal min and max means all survivors tie. In every other round, removing exactly all current minima matches the simultaneous rule. At least one candidate is removed without removing everyone, so the process terminates at a correct majority or tie.

## Complexity

There are at most `N-1` elimination rounds. Each scans up to B ballots with N ranks, for `O(BN^2)` worst-case time and `O(BN)` storage.

## Common mistakes

- Treating exactly half as a majority.
- Eliminating only one candidate from a lowest tie.
- Including dead candidates when finding the minimum.
- Giving one ballot to multiple survivors.
- Reading candidate names as single words.
