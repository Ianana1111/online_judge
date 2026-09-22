# Combine shortest travel costs with a subset shopping plan

## Problem and constraints

Daniel starts at home, may visit any stores offering DVD savings, and must return home. The goal is to maximize total purchase savings minus travel cost. There are up to 50 stores, 1,000 undirected roads, and 12 discounted DVDs. Parallel roads and multiple offers at one store are possible. Monetary values have exactly two decimal places, and a zero net saving is not worth leaving home.

## Building the approach

Separate the problem into travel costs and shopping choices. Parse every amount as integer cents, keep the cheapest parallel road, and run Floyd-Warshall to obtain the minimum cost between every pair of locations. Sum all discounts at the same store because one visit can collect them together without extra travel.

Only stores with savings matter to the decision layer. Number them after home and use a bitmask for collected stores. Let `best(mask,current)` be the maximum additional net saving from the current important location. One option is to stop shopping and return home, worth `-cost[current][home]`. For every unvisited offer store, another option gains its savings, pays the shortest travel cost, and continues from the enlarged mask.

Starting from `best(0,home)` includes the choice of never leaving, whose total is zero after the immediate return to the same place.

## Walkthrough

Suppose the only store is one dollar from home and has two DVDs saving $1.50 each. Their combined saving is $3.00 and the round trip costs $2.00, so Daniel saves $1.00. Overwriting one offer with the other would incorrectly make the trip look unprofitable. If the single total saving is exactly $2.00, the net result is zero and the correct output says to stay home.

## Why it works

With nonnegative road costs, replacing travel between purchases by a shortest path never worsens a trip. All offers at one store can be collected on the same visit, and revisiting that store adds no profit. For any DP state, an optimal remaining trip either returns home immediately or next visits one uncollected offer store; the transition enumerates all such choices. By induction on the number of unvisited stores, each state is optimal. If a shortest route passes another offer store, visiting it can be inserted at no extra travel cost and is represented by an equivalent DP ordering. Therefore the initial state considers every profitable tour and its complete return cost.

## Complexity

Let `V=N+1` and let `K<=12` be the number of distinct offer stores. Floyd-Warshall takes `O(V^3)` time and `O(V^2)` space. The subset DP takes `O(K^2 2^K)` time and `O(K 2^K)` cached states.

## Common mistakes

- Forgetting the final travel cost back home.
- Overwriting rather than adding multiple offers at one store.
- Keeping an expensive parallel road instead of the cheapest one.
- Treating a zero net saving as a reason to leave.
- Using binary floating point and misclassifying a one-cent boundary.
