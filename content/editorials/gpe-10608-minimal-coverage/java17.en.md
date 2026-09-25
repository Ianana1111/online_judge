Keep `covered` as the right end of a continuously covered prefix beginning at zero. To avoid a gap, the next useful interval must begin at or before `covered`. Among all such intervals, choose the one ending farthest right.

This is the opposite of the earliest-finish rule used in activity selection: here overlap is allowed, and the goal is maximum progress per selected interval. Sort by left endpoint so all currently eligible intervals can be scanned together. The scan pointer never moves backward. Every rejected eligible interval ends no farther than the selected one, so it cannot help after this extension.

If no eligible interval strictly extends the prefix, coverage is impossible. Otherwise save the original interval, advance `covered`, and continue until it reaches M. Negative left endpoints and right endpoints beyond M are allowed; do not invent clipped or merged intervals for output.

Sort by left endpoint. Among intervals starting before the covered boundary, choose the one reaching farthest right. If none extends coverage, a complete cover is impossible.
