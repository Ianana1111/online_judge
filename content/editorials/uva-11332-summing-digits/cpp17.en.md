The input-loop condition discards the terminating zero. The middle loop runs only while `value >= 10`, so one-digit inputs are printed directly.

Each round creates a fresh `sum`. The innermost loop obtains one digit with `% 10` and removes it with `/ 10`; afterward `value` is zero and must be replaced with `sum` for the next round. The final value lies from 1 through 9 and is printed without any modulo shortcut.
