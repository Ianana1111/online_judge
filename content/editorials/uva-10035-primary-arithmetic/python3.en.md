Imagine adding the numbers on paper. The units column is independent of all columns to its left, but the tens column depends on whether the units column produced a carry. This tells us both the processing order and the only state we need to remember.

Extract the current digits with remainder modulo ten. Their sum must include the incoming carry. If that total is at least ten, this column produces a new carry: increment the answer and carry one into the next column. Otherwise the outgoing carry becomes zero. Divide both numbers by ten to move left.

Continue while either number still has digits. A shorter number simply contributes zero. Do not count the final leading carry again: the operation that created it was already counted in the previous column.

Only the pair zero-zero ends input; a single zero is still a normal case.
