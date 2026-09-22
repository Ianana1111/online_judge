# Format signs separately from the body of each polynomial term

## Problem and constraints

Each input line contains nine coefficients for powers `x^8` through `x^0`, with magnitudes below 1000. Print the polynomial in the required compact form: omit zero terms, omit coefficient 1 on nonconstant terms, print `x` rather than `x^1`, and print no variable for constants. The all-zero polynomial is `0`, and sign spacing is part of the answer.

## Building the approach

Scan coefficients from highest degree to lowest. Skip zeros and keep a boolean `first` indicating that no real term has been printed.

For the first nonzero term, print nothing for a positive sign and only `-` for a negative sign. For later terms, print either ` + ` or ` - `. Once the sign is handled, work only with the coefficient magnitude. Print the magnitude when the degree is zero or it differs from one. Print `x` for every positive degree and append `^degree` only above degree one.

Separating the connector from the term body avoids combinations such as `+ -` and keeps the unit-coefficient exception from incorrectly removing a constant one. If `first` remains true after all nine coefficients, print zero.

## Walkthrough

With coefficients producing `-x^2 + x - 1`, the magnitude one is omitted from both variable terms but retained for the constant. Degree one prints just `x`. Leading zero coefficients do not create an early plus sign, and a polynomial containing only constant 1 must still print `1`.

## Why it works

The input scan order is exactly descending degree, and skipping precisely the zero coefficients preserves all and only meaningful terms. `first` applies the unique leading-sign rule once, while every later term receives the correctly spaced binary sign. The magnitude, variable, and exponent conditions match each required term form. If no term exists, the final zero handles the sole exceptional representation.

## Complexity

Exactly nine coefficients are processed, so time and extra space are both `O(1)`.

## Common mistakes

- Printing `+` before a positive leading term or a space before a negative one.
- Producing ` + -` for negative later terms.
- Omitting a constant coefficient equal to one.
- Printing `x^1`.
- Emitting an empty line for the all-zero polynomial.
- Clearing `first` while skipping a zero coefficient.
