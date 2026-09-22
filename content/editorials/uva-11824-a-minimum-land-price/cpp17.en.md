All price tokens are consumed before sorting. Decimal parsing caps values at `budget+1`, so later digits cannot overflow yet every capped value remains certainly unaffordable where relevant.

Reverse-iterator sorting produces descending order. Entry `i` multiplies from power one exactly `i+1` times. The division guard precedes multiplication, and total comparison uses strict `>` so exact-budget results remain valid integers.
