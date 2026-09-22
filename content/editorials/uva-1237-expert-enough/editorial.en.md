# Count every inclusive price-range match before deciding

## Problem and constraints

Each manufacturer has an inclusive minimum and maximum car price. For every query price, print the manufacturer's name only when exactly one range contains it; print `UNDETERMINED` for zero or multiple matches. There are fewer than 10,000 manufacturers and 1,000 queries per case.

## Building the approach

For each query, scan every manufacturer and test `low <= price <= high`. Count matches and remember the matched name. Do not stop at the first match, because a later overlapping interval changes the answer to undetermined.

After the complete scan, output the saved name only when the count is exactly one. The problem bounds keep this direct and easily verified `D*Q` work practical.

## Walkthrough

If maker A covers 10 through 20 and B covers 20 through 30, price 10 uniquely identifies A. Price 20 belongs to both closed intervals and is undetermined, while 31 belongs to neither and is also undetermined.

## Why it works

The scan evaluates the inclusive membership predicate for every database row, so `matches` equals the complete number of compatible manufacturers. A count of one makes the saved name the unique answer. Counts of zero and at least two mean absence and ambiguity respectively, both requiring `UNDETERMINED`. These cases exhaust all possibilities.

## Complexity

One case takes `O(DQ)` time and `O(D)` storage for the database. No price-sized lookup table or approximate arithmetic is needed.

## Common mistakes

- Returning immediately after the first match.
- Excluding either interval endpoint.
- Printing the last match when several ranges overlap.
- Carrying match state from one query to the next.
- Omitting the blank line between test cases.
