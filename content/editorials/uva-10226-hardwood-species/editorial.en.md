# Count full species names and let an ordered map produce the output order

## Problem and constraints

Each test case lists one observed tree per line. A complete line is the species name, which may contain spaces and has length at most 30. A case can contain up to 10000 species and one million trees. Print every species in lexicographic order with its percentage of the case, formatted to four decimal places. Test cases are separated by blank lines, and the outputs need a blank line between cases.

## Building the approach

At heart, this is a frequency table over complete strings. Because the final output also needs its keys sorted by name, an ordered `map<string,long long>` handles both needs: increment the count while reading, then traverse the same map in lexicographic order.

Use `getline`, since token-based input would split a name such as `Red Oak`. Keep a separate `total` count, and construct a fresh map for every test case. Leading separator lines should be skipped, while an empty line after at least one tree ends the current case.

For a species with count `c` among `t` trees, the percentage is `100*c/t`. Four decimal digits mean scaling that percentage by 10000, so the exact scaled fraction is `c*1000000/t`. The implementation rounds that nonnegative rational value with integer arithmetic and then separates the integer and four-digit fractional parts. This avoids binary floating-point differences at an exact midpoint.

## Walkthrough

Suppose a case contains `Ash`, `Red Oak`, and `Red Oak`. The map stores counts one and two, and `total` is three. Ordered traversal prints `Ash` before `Red Oak`. Their percentages round to `33.3333` and `66.6667`.

If a case contains only one species, its scaled value is exactly 1000000, which is printed as `100.0000`. For a very rare species, leading zeroes in the fractional part still need to be printed, so integer splitting must be paired with width-four zero padding.

## Why it works

Each nonempty input line increments exactly the entry for that full species name and increments `total` once. Consequently, after the case is read, every stored count equals that species' frequency and `total` equals the number of trees. Ordered-map traversal gives precisely the required lexicographic ordering.

The scaled rational `c*1000000/t` is the exact percentage multiplied by 10000. Adding half the positive denominator before integer division rounds it to the nearest scaled integer, with a consistent choice at an exact half. Splitting that integer at the 10000 boundary changes only its formatting, so every printed percentage represents the correctly rounded frequency.

## Complexity

Let `T` be the number of trees, `K` the number of distinct species, and `L` the maximum name length. Map updates take `O(T * L * log K)` time, and the stored names and counts use `O(KL)` space. The program never stores all one million input lines.

## Common mistakes

- Reading with `cin >> name` and truncating species names that contain spaces.
- Sorting by frequency instead of by species name.
- Forgetting to multiply the fraction by 100 to obtain a percentage.
- Using a 32-bit integer for the scaled numerator.
- Carrying counts from one test case into the next.
- Omitting the blank line between output cases or printing an unwanted extra separator.
- Printing fewer than four digits after the decimal point when leading zeroes are needed.
