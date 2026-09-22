There is an empty pool that needs to be filled with water at a desired temperature. To do this, you
have a row of jars placed near the border of the pool and numbered starting at 0. Each jar contains
a different volume of water at a different temperature. You can pour as many jars as you want to the
pool, but only if they are consecutive.

The objective is to fill at least half the capacity of the pool, without overflowing it, so that the
resulting water temperature is as close as possible to a target temperature, and never more than 5
degrees hotter or warmer. We will assume that, when mixing two volumes of water, the resulting
temperature of the mix is the average of the original temperatures weighted by volume.

For example, you may have 5 jars as follows:

| Jar number | Volume (l) | Temperature (°C) |
|---|---|---|
| 0 | 45 | 23 |
| 1 | 20 | 40 |
| 2 | 67 | 22 |
| 3 | 109 | 11 |
| 4 | 9 | 56 |

This way, for example, you could pour jars 1, 2 and 3 into the pool, but not only jars 1 and 3.

The resulting total volume (assuming that the pool is large enough) would be 20 + 67 + 109 = 196
liters and the resulting temperature would be (20 × 40 + 67 × 22 + 109 × 11) / (20 + 67 +109) =
17.719388 °C.

### Input

The input format is as follows.

An integer in a single line which says the number of problems to solve. Then, for each problem:

- A line with two integers: the maximum capacity of the pool and the target temperature.
- A line with one integer: the number of jars, which will not be greater than 3000.
- Then, a line for each jar containing two integers: the volume of water in the jar and its temperature.

### Output

For each problem, you have to print a line with two integers representing the first and the last jar to
pour into the pool, minimizing the difference with respect to the target temperature.

If there is no way to fill at least half the pool without overflowing it with water within the acceptable
temperature range, the line should be ‘Not possible’. If there are many optimal solutions, you have
to use the jars with the lowest numbers.

### LOCAL platform clarification

Pool capacity is positive and jar water volumes are nonnegative integers. A chosen interval must have positive total volume. Ties are resolved by smaller first jar index, then smaller last jar index, using zero-based indices. Exact half capacity, exact full capacity, and temperature difference exactly five degrees are allowed.
