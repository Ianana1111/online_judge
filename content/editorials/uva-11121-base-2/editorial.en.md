# Repeatedly remove a valid bit in base negative two

## Problem and constraints

Convert each integer from `-10^9` through `10^9` to base `-2`. The representation may use only digits 0 and 1, has no sign and no leading zero, and must represent zero as `0`. Up to 10,000 cases are given. Position `i` has weight `(-2)^i`, so the signs of successive place values alternate.

## Building the approach

Ordinary base conversion repeatedly extracts a remainder and divides by the base. The same idea works here if the remainder is forced to be a valid digit. From

`n = bit + (-2) * next`,

`bit` must be 0 or 1 and have the same parity as `n`. Normalize the C++ remainder with `(n % 2 + 2) % 2`, because a negative odd number may otherwise produce `-1`. Then compute `next = (n - bit) / -2` exactly.

The extracted digits arrive from least significant to most significant, so reverse them at the end. A `do-while` loop is useful because zero must still generate one digit. The quotient may alternate between positive and negative, so the loop must continue until it equals zero rather than only while it is positive.

## Walkthrough

For `n = -3`, choose bit 1 and obtain `next = 2`. From 2 choose bit 0 and obtain `-1`; from `-1` choose bit 1 and obtain 1; finally choose bit 1 and obtain 0. The low-to-high digits are `1, 0, 1, 1`, which reverse to `1101`. Its value is `-8 + 4 + 0 + 1 = -3`.

## Why it works

At every step, the normalized parity is the unique value in `{0,1}` for which `n - bit` is divisible by `-2`. Therefore the equation `n = bit + (-2) * next` holds exactly. Repeatedly substituting the equation expresses the original number as the extracted bits multiplied by successive powers of `-2`. The quotient's magnitude eventually decreases to zero. For a nonzero input, the last extracted digit is 1, so the reversed output has no leading zero.

## Complexity

The representation has `O(log(|n| + 1))` digits. Both the running time and output storage are of that order.

## Common mistakes

- Using a negative remainder as a digit.
- Dividing by positive 2 and producing ordinary binary.
- Stopping when the quotient becomes negative.
- Forgetting to reverse the least-significant-first digits.
- Printing an empty string for zero or adding a minus sign.
