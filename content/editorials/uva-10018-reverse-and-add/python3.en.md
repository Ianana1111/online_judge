To reverse an integer, repeatedly take its last digit, append it to a result by multiplying that result by ten, and remove the digit by dividing the input by ten. Trailing zeros in the original naturally become omitted leading zeros in the numeric reversal.

For every iteration, assign `value += reverse(value)`, increment the count, and only then compare the new value with its reversal. A do-while loop directly encodes the mandatory first addition.

Use an unsigned 64-bit type because valid outputs can exceed signed 32-bit range. The problem guarantee supplies termination; imposing a smaller arbitrary iteration limit would reject legal cases.

Even an initially palindromic number needs one reverse-and-add operation; check after each addition.
