At heart, this is a frequency table over complete strings. Because the final output also needs its keys sorted by name, an ordered `map<string,long long>` handles both needs: increment the count while reading, then traverse the same map in lexicographic order.

Use `getline`, since token-based input would split a name such as `Red Oak`. Keep a separate `total` count, and construct a fresh map for every test case. Leading separator lines should be skipped, while an empty line after at least one tree ends the current case.

For a species with count `c` among `t` trees, the percentage is `100*c/t`. Four decimal digits mean scaling that percentage by 10000, so the exact scaled fraction is `c*1000000/t`. The implementation rounds that nonnegative rational value with integer arithmetic and then separates the integer and four-digit fractional parts. This avoids binary floating-point differences at an exact midpoint.

Read whole species names, sort them, and compute the percentage as scaled integer arithmetic before printing four decimals.
