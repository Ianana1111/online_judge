Compare two adjacent jobs A and B. If A runs first, B waits an extra `T_A` days and contributes `T_A*S_B`. If B runs first, A contributes `T_B*S_A`. All other jobs have identical waiting time in either local order.

Therefore A belongs before B exactly when `T_A*S_B < T_B*S_A`. This is equivalent to increasing `T/S`, but cross multiplication stays exact and avoids floating-point ties. When both products are equal, the two local orders have equal cost, so smaller original ID comes first to obtain the lexicographically smallest optimum.

Sort complete job records using this comparator, then output their saved IDs.

Compare the two possible orders with cross products tₐfᵦ and tᵦfₐ; preserve input order on a tie.
