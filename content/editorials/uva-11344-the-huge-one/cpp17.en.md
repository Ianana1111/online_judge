`number` retains the arbitrary-length decimal text, and the complete divisor list is read before classification. Each divisor begins with a fresh zero remainder and scans every character, converting it with `digit - '0'`.

`wonderful &= remainder == 0` makes any failure permanent while still checking later divisors. Output reuses the original string, avoiding any large-number formatting and preserving its textual form. Zero naturally produces a zero remainder for every positive divisor.
