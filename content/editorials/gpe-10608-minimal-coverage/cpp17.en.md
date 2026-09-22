Sorting `pair<int,int>` entries orders them by left endpoint, with right endpoint as a harmless tie-breaker. `at` scans each interval once, and `covered` starts at zero.

For each extension, `farthest` starts at the current endpoint and `chosen` at −1. Only a strictly larger right endpoint updates them, so a chosen interval always makes progress. The eligibility condition uses `<=`, accepting closed intervals that meet exactly at an endpoint.

If no interval was chosen, `answer.clear()` discards the incomplete prefix and makes the printed count zero. Otherwise the exact stored input pair is appended. Later chosen intervals come from later scan ranges, so their left endpoints are already ordered. The output inserts one blank line between cases.
