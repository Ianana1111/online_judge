`press` is the button mask for the current row, not its current light state. `previous` stores the press mask from the row above. XORing the original lights, current horizontal cross, and previous vertical effect gives `next`, the exact buttons required below the current row.

The code counts `press` before deriving the next mask, so both the first and tenth row presses are included. The shifted-left mask is restricted with `1023`, which keeps only the ten board columns.

After ten iterations, `press` represents the requirement for a nonexistent eleventh row. Only zero is feasible. The initial answer of 101 is larger than every possible useful press count and is converted to `-1` only if no first-row choice succeeds.
