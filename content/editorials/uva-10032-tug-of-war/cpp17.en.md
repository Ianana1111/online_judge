Each `possible[count]` bitset stores all reachable weights. Shifting left by `w` adds the current person's weight to every source. `seen` avoids touching count rows larger than the number processed, while descending count preserves 0/1 use.

The final loop scans the complete weight range for the required team size, which includes cases where the smaller team is heavier. On improvement, `min` and `max` construct lower and higher output totals independently of which subset was selected. Cases receive a blank separator and fresh state.
