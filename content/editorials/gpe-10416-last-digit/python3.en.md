Because only the last digit matters, every multiplication and addition can be reduced modulo ten. That avoids huge powers, but iterating up to N is still impossible. We need repeated structure in the sequence of terms.

The last digit of iⁱ repeats after 20 terms. Adding 20 preserves the base's last digit, and the exponent increases by a multiple of every possible last-digit power period: 1, 2, or 4. However, a repeating term sequence does not automatically make its prefix sums repeat with the same period.

The first 20 terms sum to 4 modulo ten. Five such blocks contribute 20, or zero modulo ten. Thus every complete block of 100 terms can be discarded, leaving only the prefix of length `N mod 100`. Precompute those 100 possible answers, and obtain the remainder by scanning N's decimal digits.

All versions scan the decimal string for its remainder modulo 100. The terminator is a truly zero number, not a positive multiple of 100.
