The minute hand is at `6M` degrees. The hour hand is at `30*(H mod 12) + 0.5M`. Take their absolute difference and the smaller of that value and its complement to 360 degrees.

To avoid fractions during comparison, use half-degree units. The hour position is `60*(H mod 12)+M`, the minute position is `12M`, and a full circle is 720 units. After selecting the shorter circular difference, divide by `2.0` for output. Every possible result is an integer or half degree, so this representation is exact.

Compare the direct separation with a full turn minus it to obtain the smaller angle.
