Repeatedly subtracting L from a positive integer S and stopping at L is possible exactly when S is a positive multiple of L. The same L must work for both values, so the question is whether they share any divisor at least two.

Parse each binary string into an integer using `value=value*2+bit`, compute their greatest common divisor, and test whether it is greater than one. No subtraction simulation or divisor enumeration is required. Thirty bits fit safely in signed `int` under the given maximum.

`int(bits, 2)` preserves the intended binary value without simulating repeated subtraction.
