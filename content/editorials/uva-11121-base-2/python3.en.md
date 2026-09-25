Ordinary base conversion repeatedly extracts a remainder and divides by the base. The same idea works here if the remainder is forced to be a valid digit. From

`n = bit + (-2) * next`,

`bit` must be 0 or 1 and have the same parity as `n`. Normalize the C++ remainder with `(n % 2 + 2) % 2`, because a negative odd number may otherwise produce `-1`. Then compute `next = (n - bit) / -2` exactly.

The extracted digits arrive from least significant to most significant, so reverse them at the end. A `do-while` loop is useful because zero must still generate one digit. The quotient may alternate between positive and negative, so the loop must continue until it equals zero rather than only while it is positive.

Python `% 2` stays zero or one for negative numbers; zero input still emits one digit 0.
