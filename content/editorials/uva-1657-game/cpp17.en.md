Pairs are generated once in increasing x,y order. `alive` marks current common knowledge, and turn parity selects sum or product. All class counts finish before singleton indices are collected and then removed, preserving simultaneous reasoning.

`answers[turn]` stores knowing pairs, not survivors. A pair appears in at most one answer round. Two empty removals are required before stopping, since failure of one player's partition alone does not imply failure of the other's. Results are cached by N and printed as an unordered answer set accepted by the special checker.
