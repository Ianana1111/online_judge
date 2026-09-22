# Track both moving hands in exact half-degree units

## Problem and constraints

For each 12-hour time `H:MM`, print the smaller angle between the hour and minute hands, from 0 through 180 degrees, with three decimals. `0:00` ends input, while `12:00` is a valid time. The hour hand moves continuously as minutes pass.

## Building the approach

The minute hand is at `6M` degrees. The hour hand is at `30*(H mod 12) + 0.5M`. Take their absolute difference and the smaller of that value and its complement to 360 degrees.

To avoid fractions during comparison, use half-degree units. The hour position is `60*(H mod 12)+M`, the minute position is `12M`, and a full circle is 720 units. After selecting the shorter circular difference, divide by `2.0` for output. Every possible result is an integer or half degree, so this representation is exact.

## Walkthrough

At `3:00`, the angle is 90 degrees. At `3:30`, the hour hand has advanced to 105 degrees while the minute hand is at 180, so the result is 75 rather than 90. Near `11:59`, the complement across twelve is shorter than the raw difference. At `12:00`, both hands coincide and output is `0.000`.

## Why it works

The angular-speed formulas give each hand's exact position relative to twelve. Those positions divide the circle into arcs of lengths equal to the absolute difference and `360` minus that difference; the smaller is precisely the requested angle. Multiplying all angles by two preserves ordering and exactness, and the final division restores degrees.

## Complexity

Each time uses `O(1)` arithmetic and `O(1)` space.

## Common mistakes

- Leaving the hour hand fixed on an hour mark.
- Returning the raw angle without choosing its complement.
- Treating valid `12:00` as the `0:00` sentinel.
- Dividing with integer arithmetic and losing half degrees.
- Omitting trailing zeros required by three decimals.
