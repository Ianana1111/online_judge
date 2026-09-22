# Enumerate consecutive jars and compare weighted temperatures exactly

## Problem and constraints

Choose a nonempty consecutive jar interval with positive total water. Its volume must be at least half and at most the positive pool capacity, and its weighted temperature must differ from target by at most five degrees. Minimize that difference, breaking ties by smaller start then end index; print `Not possible` if none exists. There are at most 3,000 jars with nonnegative volumes.

## Building the approach

For each start, extend the end while maintaining volume `V` and heat sum `H=sum(amount*temperature)`. The mixture error is `|H-target*V|/V`. Because volumes are nonnegative, once V exceeds capacity, every longer interval is also invalid.

Use integer conditions: `2V>=capacity`, `V<=capacity`, positive V, and `|H-target*V|<=5V`. Compare errors `e1/V1` and `e2/V2` by `e1*V2 < e2*V1`. Enumerating starts and ends increasingly and updating only on strict improvement automatically preserves lexicographic tie order. The first zero error is globally optimal and may return early.

## Walkthrough

For capacity 10 and target 20, jars `(3,10),(3,30)` together have volume 6 and exact weighted temperature 20, so answer `0 1`. A five-liter jar at 25 degrees is both exactly half full and exactly five degrees away, and remains legal.

## Why it works

Every consecutive interval appears once in the nested loops. Capacity overflow safely prunes only longer nonnegative-volume intervals. Accumulated V and H give the exact weighted average, and multiplying by positive V makes each integer test equivalent to its fractional condition. Exact cross multiplication selects the smallest error. Enumeration order plus strict updates preserves required ties, and zero is the absolute-error lower bound.

## Complexity

At most `N(N+1)/2` intervals give `O(N^2)` arithmetic time and `O(N)` storage for jars, with `O(1)` additional working state. Python integers keep cross products exact.

## Common mistakes

- Averaging jar temperatures without volume weights.
- Using integer `capacity/2` for an odd capacity.
- Excluding exact half, full, or five-degree boundaries.
- Comparing truncated or approximate floating-point temperatures.
- Updating on ties and replacing earlier indices.
