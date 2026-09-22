# Make each seating rule an edge capacity

## Problem and constraints

Seat up to 70 teams at up to 50 tables. Teams contain 1 to 100 people and tables have 2 to 100 seats. No two members of the same team may share a table. If everyone can be seated, print one and an assignment for each team in its original order; otherwise print zero. Tables may have empty seats, and any valid complete assignment is accepted.

## Building the approach

Enough total seats is necessary but not sufficient. A large team also needs enough distinct tables, and choices for different teams compete. Model the allocation as flow so earlier choices can be rearranged.

Create source → team → table → sink layers. A source-to-team edge has capacity equal to team size. Every team-to-table edge has capacity one, directly enforcing that teammates cannot share a table. Each table-to-sink edge has capacity equal to its seats.

One unit of flow now means one person seated. Compute maximum flow and require it to equal the total number of people. If successful, read the used team-to-table edges to recover an assignment. Residual reverse edges are essential: they let the algorithm move someone to another table instead of getting stuck with its first choices.

The reference uses Dinic's algorithm, alternating BFS level graphs with flow pushes along increasing levels.

## Walkthrough

Teams have sizes 1, 2, and 2, while two tables have capacities 2 and 3. If the one-person team initially takes table one and the next team takes one seat at each table, the last team appears blocked. Moving the first team to table two frees one seat at each table for the last team. All five people can then be seated.

## Why it works

Any legal seating defines an integral flow obeying team totals, one teammate per table, and table capacities. Conversely, an integral flow equal to total demand saturates every source-to-team edge; interpreting each middle-edge unit as a seat gives a legal complete arrangement. Thus maximum flow reaches total demand exactly when seating is possible. Residual augmentation preserves flow conservation, and the final unreachable sink certifies no more flow can be sent.

## Complexity

With V = teams + tables + 2 and E = teams×tables + teams + tables forward edges, general Dinic has O(V²E) time and O(V + E) space. Here V ≤ 122 and E ≤ 3,620. Extracting the seating uses O(teams×tables) work.

## Common mistakes

- Checking only total seats.
- Giving a team-to-table edge capacity greater than one.
- Omitting reverse residual edges.
- Printing success for a partial flow.
- Losing the original team order when outputting assignments.
