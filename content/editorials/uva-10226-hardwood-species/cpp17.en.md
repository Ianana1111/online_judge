The program reads the case count as a line and then continues entirely with `getline`. A trailing carriage return is removed to support CRLF input. Empty lines before the first tree are skipped; after `total` becomes positive, an empty line ends the case.

The ordered map both counts complete names and supplies lexicographic iteration. `long long` is used for counts and for `count * 1000000`, whose maximum can reach one trillion.

`scaled` is the percentage multiplied by 10000 and rounded as an integer. Dividing it by 10000 produces the integer part, while the remainder is the four-digit fractional part. `setw(4)` and a zero fill preserve leading zeroes, after which the fill character is restored. The outer loop prints the separator only before later cases, producing exactly one blank line between result blocks.
