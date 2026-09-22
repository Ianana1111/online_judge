# Use digit sums for divisibility and count reductions to nine

## Problem and constraints

Each input is a positive decimal integer of up to 1000 digits; the literal line `0` terminates input. Determine whether it is divisible by nine. If so, repeatedly sum decimal digits until reaching nine and print the number of digit-sum layers, the 9-degree. The number 9 itself has degree one, and the original input string must appear in output.

## Building the approach

Because `10` is congruent to one modulo nine, an integer and its digit sum have the same remainder modulo nine. Sum the input characters directly without converting the huge number.

If the first sum is not divisible by nine, report failure. Otherwise set degree to one for this first digit-sum layer. While the sum is not nine, take its digit sum again and increment the degree. The first sum is at most 9000, so subsequent work fits easily in `int`.

A positive multiple of nine cannot reduce to zero; repeated digit sums eventually reach the only positive one-digit multiple of nine, which is nine.

## Walkthrough

For 99, the first sum is 18 and the second is nine, so degree is two. `999999` becomes 54 then nine, also degree two. Input 9 produces nine on its first layer and therefore degree one.

For 10, the sum is one and divisibility fails immediately.

## Why it works

Every decimal place is a power of ten and hence congruent to one modulo nine, proving that digit sum preserves the remainder and correctly tests divisibility.

For a multidigit positive number, digit sum strictly reduces its magnitude. Repeated sums of a positive multiple of nine therefore terminate at nine. Starting the counter after the first sum and incrementing once per further sum matches the defined degree exactly.

## Complexity

The first scan takes `O(L)` for L input digits and stores `O(L)` to preserve output. Later sums operate on a value at most 9000 and add constant small work.

## Common mistakes

- Parsing the thousand-digit number into a fixed-width integer.
- Assigning degree zero to the number nine.
- Overwriting the original string needed for output.
- Treating any embedded zero digit as the terminator.
- Trying to reach nine without first rejecting nonmultiples.
- Omitting the fixed sentence punctuation.
