`digitSum` repeatedly extracts decimal digits. Inside `smith`, mutable `remaining` is factored while `value` preserves the original number for the final comparison. `count` includes every prime-factor occurrence, so `2*2` has count two rather than one.

The loop bound uses the shrinking remainder. Each divisor is removed completely before advancing, and a leftover above one is added once. The main program increments the input before its first test, enforcing “larger than n,” then checks consecutive values independently until the first match.
