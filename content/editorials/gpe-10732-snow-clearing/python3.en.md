The two speeds suggest a route optimization problem, but first ask whether any cleared lane must be repeated. Model each lane as a directed edge. Every street contributes one edge in each direction, so every junction has equal indegree and outdegree. The reachable network therefore has an Euler circuit beginning and ending at the garage.

That circuit clears each directed lane exactly once, with no extra travel on cleared roads. It also meets an unavoidable lower bound: every lane must be cleared at least once at 20 km/h. Thus the 50 km/h speed is never needed in an optimal route.

If the sum of the supplied one-way street lengths is L meters, the total clearing distance is 2L. Convert once at the end: `2L / 20000` hours, or `6L / 1000` minutes. Sum geometric lengths before rounding, then split the rounded minutes into hours and minutes.

Sum each road segment’s Euclidean length; the clearing vehicle traverses every road in both directions, which leads to the given six-minute-per-kilometre conversion. Round total minutes, then format hours and minutes.
