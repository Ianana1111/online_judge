# Build the lexicographically smallest Euler circuit by backtracking

## Problem and constraints

Every undirected street must be traveled exactly once, the trip must return to its start, and among all valid trips we need the lexicographically smallest sequence of street numbers. The start is the smaller endpoint of the first input street, not the smallest vertex in the graph. Street numbers are unique and below 1995; loops and parallel streets are allowed.

## Building the approach

This is an Euler-circuit problem. In a closed trip, every arrival at a vertex must be paired with a departure, so every vertex incident to a street must have even degree. If any degree is odd, no round trip exists.

After sorting each adjacency list by street number, run Hierholzer's algorithm. From the current vertex, take the smallest unused street and recurse to its other endpoint. Append the street number only after the recursive call returns, then reverse the completed list.

The postorder append matters. A tempting small street may close a partial cycle before other streets can be attached. Backtracking places that closed portion later, while another unfinished branch is spliced in before it after reversal. A single `used[id]` flag represents both adjacency entries of an undirected street, so a loop stored twice is still traveled once.

Finally, require the route length to equal the number of input streets. This prevents an incomplete component from being accepted even if all visited degrees were even.

## Walkthrough

Suppose the start has a low-numbered loop and two parallel streets that form a trip to another vertex and back. The loop contributes two to the degree but is one street. Sorted traversal considers its small number first; postorder construction then joins it with the other closed portion in the correct Euler order. If any vertex has odd degree, pairing arrivals with departures is impossible and the failure sentence is printed.

## Why it works

Even degree is necessary for a closed traversal. In a connected undirected graph where every degree is even, following unused streets creates a closed trail; any remaining streets can be reached at a vertex on that trail and form another closed trail, which Hierholzer's postorder recursion splices into the first. Therefore every street is used exactly once and the result returns to the prescribed start.

For ordering, adjacency lists present candidate street numbers from smallest to largest. A candidate that can remain at the current position does so. If taking it completes a subcycle too early, postorder delays that subcycle until unfinished branches have been inserted; after reversal, the first feasible choice at each differing position is the smallest one. Thus the resulting valid street-number sequence is lexicographically minimal.

## Complexity

Sorting costs `O(E log E)` overall, and every adjacency entry is scanned at most once, so traversal costs `O(E)`. Space usage is `O(V + E)`, with recursion depth at most `E`.

## Common mistakes

- Choosing the globally smallest vertex instead of the first street's prescribed start.
- Appending or printing a street before finishing its recursive branch.
- Identifying streets only by endpoints and merging parallel streets.
- Counting a loop as degree one.
- Checking even degrees without confirming that every street entered the route.
