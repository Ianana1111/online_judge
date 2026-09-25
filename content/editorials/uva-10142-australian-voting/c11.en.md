Keep an `alive` flag for every candidate and preserve every ballot's original ranking. At the start of each round, clear vote counts. For each ballot, scan its ranking until the first alive candidate, give exactly one vote, and stop.

Find minimum and maximum votes among alive candidates only. First test strict majority with `2*most > ballotCount`. If it fails and minimum equals maximum, every survivor ties and wins. Otherwise mark all candidates at the minimum dead at once, then start a fresh recount.

Simultaneous elimination is essential. Removing one tied-low candidate and recounting immediately could transfer ballots to another candidate who should have been eliminated in the same round.

In every round, transfer each ballot to its highest-ranked surviving candidate, then inspect only surviving vote totals. A strict majority wins; equal totals tie; otherwise eliminate every candidate with the minimum tally simultaneously.
