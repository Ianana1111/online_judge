# Mark the union of strike days, then remove weekends

## Problem and constraints

Simulate `N` days with Sunday as day one. Each political party strikes on positive multiples of its period `h`. Friday and Saturday are already holidays and do not count as lost working days. Here `7<=N<=3650`, there are up to 100 parties, and periods are positive and not multiples of seven. Count days on which at least one party strikes and work would otherwise occur.

## Building the approach

The answer is a union of dates, not a sum of party strike counts. Create a boolean array `stopped`. For every party period `h`, mark `h,2h,3h,...` through `N`. Multiple parties writing true to one day still leave one boolean event.

After all marking, scan days one through N once. With Sunday at day one, day six is Friday and day seven is Saturday, so residues 6 and 0 modulo seven are excluded. Count a day only when it is marked and has neither weekend residue.

A period longer than the simulation simply marks nothing and needs no special handling.

## Walkthrough

For `N=14` and periods 3, 4, and 8, the marked union is days 3, 4, 6, 8, 9, and 12. Day six is Friday and is removed, leaving five lost working days. Day twelve is shared by periods three and four but is counted once.

With period one, every day is marked but each seven-day week still loses only five working days.

## Why it works

For a party with period `h`, enumerating its positive multiples marks exactly all of its strike dates. After every party is processed, `stopped[d]` is true exactly when at least one party strikes on day `d`.

The final scan applies the calendar condition independently to each date and counts every marked nonweekend date once. Therefore it includes all and only lost working days, without duplicate counting.

## Complexity

Marking costs `sum floor(N/h)` and is bounded by `O(PN)`; the final scan is `O(N)`. Extra space is `O(N)`.

## Common mistakes

- Adding per-party counts and double-counting overlap.
- Treating day one as Monday or excluding Sunday instead of Friday.
- Beginning multiples at day zero.
- Reusing marks across test cases.
- Inventing out-of-spec periods or day ranges as hidden cases.
