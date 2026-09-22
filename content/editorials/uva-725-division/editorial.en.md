# Enumerate denominators and verify all ten digit positions together

## Problem and constraints

Find every five-digit numerator divided by a five-digit denominator that equals `N`, for `2 <= N <= 79`. Across both five-character representations, digits 0 through 9 appear exactly once. A leading zero is allowed, so `01283` is valid. Output solutions by increasing numerator, or the fixed no-solution sentence, with blank lines between queries. Zero ends input.

## Building the approach

Once a denominator is chosen, the numerator is uniquely `denominator*N`; there is no need for a nested numerator search. The smallest possible integer value of a five-digit representation with unique digits is `01234`, or 1234. Enumerate upward while the numerator remains at most 98765.

Check both values with one ten-bit mask. Extract exactly five digits from each value, even after integer division reaches zero, so a leading zero occupies a real position. Reject a bit already present; after ten distinct positions, the mask necessarily contains all digits 0 through 9.

Increasing denominators produce increasing numerators because `N` is positive, so output order is automatic.

## Walkthrough

For `N=62`, `79546 / 01283` is valid because its ten displayed positions use each digit once; `94736 / 01528` is another. Ignoring denominator leading zeros would lose these solutions. Separate digit sets for numerator and denominator would wrongly allow one digit to occur in both numbers.

## Why it works

Every legal denominator has integer value at least 1234 and a numerator at most 98765, so enumeration reaches it. The equation determines exactly the numerator the loop computes. Fixed five-position extraction includes leading zeros, and rejecting repeated bits makes ten positions distinct; with only ten decimal digits, this is equivalent to each digit appearing once. Thus the test is necessary and sufficient, and each solution appears once in sorted order.

## Complexity

Each `N` tests `O(100000/N)` denominators and performs ten digit operations apiece, using `O(1)` extra space.

## Common mistakes

- Starting denominators at 10000 and excluding leading-zero forms.
- Extracting digits only while the numeric value is nonzero.
- Resetting the digit mask between numerator and denominator.
- Omitting width-five zero padding or query separators.
- Continuing after the numerator exceeds five digits.
