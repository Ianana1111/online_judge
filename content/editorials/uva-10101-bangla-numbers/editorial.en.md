# Recursively format kuti, then decompose smaller units

## Problem and constraints

Convert integers from zero through 999,999,999,999,999 into Bangla units: `kuti=10,000,000`, `lakh=100,000`, `hajar=1,000`, and `shata=100`. Input continues to EOF and zero is a normal case. Each line begins with a right-aligned case number of minimum width four and a period. Zero-valued components are omitted, while repeated `kuti` may be necessary.

## Building the approach

Process largest units first. If `n` contains kuti, recursively format `n/10,000,000`, print `kuti`, then continue with the remainder. Recursion is necessary because the quotient itself may still contain one or more kuti groups.

Within the remaining seven-digit block, extract lakh, hajar, and shata in descending order. Print a coefficient and unit only when the coefficient is nonzero, then reduce to the remainder. Print a final nonzero value below one hundred directly.

Handle an input value of zero in the caller. Internal zero remainders should print nothing, whereas the complete number zero must print one zero.

## Walkthrough

`23764` becomes `23 hajar 7 shata 64`. `10000000` becomes `1 kuti` with no trailing zero.

`100000000000000` contains ten million kuti. Recursively formatting that quotient yields `1 kuti`, then the outer unit adds another `kuti`, producing the required `1 kuti kuti`.

## Why it works

Every quotient-remainder split preserves `n=quotient*unit+remainder`. The kuti quotient is smaller than n and recursively follows the same valid representation rules. Below kuti, descending unit extraction keeps every remainder below the preceding unit, producing the unique required components.

Skipping zero coefficients does not change numeric value and prevents unwanted words. Separately printing whole-input zero distinguishes it from harmless internal zero remainders.

## Complexity

For `D` decimal digits, recursion depth and work are `O(D)`, with approximately one layer per seven digits. The stated 15-digit limit is tiny.

## Common mistakes

- Printing the kuti quotient as a flat number.
- Printing zero after every exact unit.
- Treating zero as an input terminator.
- Padding case numbers with zeros instead of spaces.
