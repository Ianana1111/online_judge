The `digits` string maps characters to values with `find` and values back to uppercase characters by indexing. Valid input guarantees each source character is legal for `from`. The target-dependent modulus is rebuilt for every conversion.

Taking the modulus after every source digit bounds all intermediates even for a very long input. `output` begins as seven zeros and is filled from index 6 down to 0, placing each least significant remainder at the right. Dividing by `to` exposes the next digit, and the final string is always exactly seven characters.
