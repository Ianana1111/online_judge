Unused regular time for one driver cannot cancel another driver's overtime, so costs must be computed after forming pairs. Sort morning routes ascending and evening routes descending, then pair equal indices. Long work from one side is balanced with short work from the other.

For each pair, add `max(0, morning+evening-D) * R`. Do not simply subtract `N*D` from the sum of all routes because the positive-part operation applies separately to each driver.

Use opposite indices after sorting and accumulate total overtime cost in `long`.
