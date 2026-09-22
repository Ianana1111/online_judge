# Maintain connected groups as commands arrive

## Problem and constraints

Computers are numbered 1 through N. Command `c a b` adds an undirected connection, while `q a b` asks whether the computers are connected directly or indirectly at that moment. Count successful and unsuccessful queries and print `successes,failures`. A test count precedes the cases, which are separated by blank lines.

## Building the approach

A search through the network could answer each query, but repeatedly exploring the same connected group wastes work. Connections are only added, so groups can merge but never split. That is exactly the situation a disjoint-set union structure models.

Initially each computer forms its own set. For a connection, find both sets' representatives and merge them. For a query, compare representatives. Use path compression and merge the smaller set into the larger to keep future searches short.

Process commands immediately in input order. Building the final network first would let future connections change answers to earlier queries. A query from a computer to itself always succeeds, and adding a connection inside an existing set changes nothing.

## Walkthrough

Initially `q 1 3` fails. Add `c 1 2` and then `c 2 3`; a subsequent `q 1 3` succeeds through computer 2. The two queries yield `1,1`. Even before any connection, `q 2 2` succeeds because both endpoints are the same vertex.

## Why it works

Initially the sets equal the graph's singleton connected components. Adding an edge merges exactly its endpoint components, which is precisely the union operation. By induction, the sets remain equal to the components after every command. Equal representatives therefore answer exactly the current reachability question, and the counters classify every query correctly.

## Complexity

Initialization takes O(N). With Q commands, path compression and union by size give O(Q α(N)) amortized processing time and O(N) space. Historical edges need not be stored.

## Common mistakes

- Checking only direct connections.
- Applying all connections before answering queries.
- Reusing parent arrays or counters across cases.
- Losing the blank-line case boundaries.
- Printing failures before successes.
