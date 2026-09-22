# Two directions per street make an Euler circuit possible

## Problem and constraints

Each straight street has one lane in each direction. Clear every lane and return to the garage. Clearing speed is 20 km/h; travel on already cleared roads would be 50 km/h. All streets are reachable from the garage, and there are at most 100 streets per case. The platform allows at most 100 cases and integer coordinates of magnitude at most 10⁹ meters. Print the minimum duration rounded to the nearest minute as h:mm, separating cases with a blank line.

## Building the approach

The two speeds suggest a route optimization problem, but first ask whether any cleared lane must be repeated. Model each lane as a directed edge. Every street contributes one edge in each direction, so every junction has equal indegree and outdegree. The reachable network therefore has an Euler circuit beginning and ending at the garage.

That circuit clears each directed lane exactly once, with no extra travel on cleared roads. It also meets an unavoidable lower bound: every lane must be cleared at least once at 20 km/h. Thus the 50 km/h speed is never needed in an optimal route.

If the sum of the supplied one-way street lengths is L meters, the total clearing distance is 2L. Convert once at the end: `2L / 20000` hours, or `6L / 1000` minutes. Sum geometric lengths before rounding, then split the rounded minutes into hours and minutes.

## Walkthrough

A single 1,000-meter street requires clearing 2,000 meters, taking six minutes: `0:06`. A 250-meter street takes 1.5 minutes; the reference rounds halfway upward to `0:02`. Under the nearest-minute rule, this platform's checker also accepts the other equally near minute for an exact half-minute tie.

## Why it works

Clearing every directed lane gives a lower bound equal to total lane length divided by clearing speed. Balanced indegrees and outdegrees in the connected reachable network guarantee an Euler circuit attaining that bound and returning to the start. Interior street intersections can be split into junctions without changing either balance or total length, so they do not alter the argument.

## Complexity

O(M) time for M streets and O(1) extra state. No explicit graph or route reconstruction is required.

## Common mistakes

- Forgetting the return-direction lane.
- Adding an unnecessary shortest path back to the garage.
- Using 50 km/h for uncleared lanes.
- Rounding each street's duration separately.
- Failing to carry 60 minutes into hours or pad minutes to two digits.
