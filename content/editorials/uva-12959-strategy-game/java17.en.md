Read with rounds as the outer loop and players as the inner loop, adding each value to that player's total. The flat input is round-major, so reversing these loops would assign scores incorrectly.

Scan totals from small to large player ID. Replace the current winner when the new total is greater than or equal to the current best. Equality deliberately moves the winner to the later, larger ID.

Create a fresh score array per case and favor the later player on a tie.
