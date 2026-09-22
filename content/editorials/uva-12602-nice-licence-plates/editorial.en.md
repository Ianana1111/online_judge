# Decode the letters as zero-based base 26

## Problem and constraints

A plate has three uppercase letters, a hyphen, and four decimal digits. Interpret letters in base 26 with `A=0` through `Z=25`, compare that value with the decimal suffix, and print `nice` exactly when their absolute difference is at most 100. Leading decimal zeroes are valid.

## Building the approach

Use Horner's method for the letters: start at zero and for each letter multiply the current prefix by 26, then add `letter-'A'`. After three iterations this equals `a*26^2+b*26+c`. Parse the substring after the hyphen as ordinary decimal.

Finally test `abs(letters-digits)<=100`. Absolute value handles either ordering, and the non-strict comparison includes the boundary.

## Walkthrough

`ABC` has value `0*676+1*26+2=28`; `0123` is decimal 123, so the difference is 95 and the plate is nice. `AAA-0100` differs by exactly 100 and is still nice, while `AAA-0101` is not.

## Why it works

After processing any prefix, Horner's recurrence equals that prefix's base-26 positional value: multiplication shifts all existing digits left and addition inserts the new least-significant digit. Decimal parsing gives the suffix value, and the final absolute inclusive comparison is exactly the definition of a nice plate.

## Complexity

Every plate has fixed length, so time and extra space are `O(1)`. All possible values fit comfortably in an `int`.

## Common mistakes

- Mapping `A` to one instead of zero.
- Giving the first letter the wrong positional weight.
- Treating a leading-zero suffix as octal.
- Comparing a signed rather than absolute difference.
- Rejecting a difference exactly equal to 100.
