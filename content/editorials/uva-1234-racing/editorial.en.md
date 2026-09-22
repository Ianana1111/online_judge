# Stop thinking about individual cycles

## Problem and constraints

Choose roads on which to install cameras so that every cycle uses at least one chosen road. Minimize the total installation cost. The graph is connected and undirected, with N < 10,000, M < 100,000, and positive costs from 1 to 1,000. The platform explicitly uses a simple graph: no self-loops or parallel roads, so a cycle contains at least three roads.

## Building the approach

Trying to list every cycle is an awkward start: there can be many of them, and two cycles may share the same camera. Instead, imagine driving only on roads without cameras. If those roads contain a cycle, that cycle escapes every camera. Therefore the roads we leave unmonitored must form a forest.

This changes the optimization question. The total cost of all roads is fixed. Paying as little as possible means leaving as much road cost as possible unpaid. We want a **maximum-weight forest**, not a minimum spanning tree.

Because the graph is connected and every cost is positive, a forest with several components can always gain another connecting road and increase its weight. The best forest is consequently a maximum spanning tree. Run Kruskal in descending cost order: keep a road when it joins two different components; otherwise put a camera on it and add its cost to the answer.

## Walkthrough

Take a triangle with road costs 5, 4, and 3. Keep the roads costing 5 and 4. The final road would close the triangle, so install a camera there for cost 3. Keeping the cheapest roads instead would make us pay for the expensive one: this small example explains why sorting must be descending.

If the input is already a tree, every road can be kept. There is no cycle to monitor, and the answer is zero.

## Why it works

Every cycle contains a monitored road exactly when the unmonitored roads are acyclic. Positive costs and connectivity extend an optimal forest to a spanning tree. Descending Kruskal finds a maximum spanning tree: when it selects the heaviest available edge across a component cut, any optimal tree can exchange a no-heavier crossing edge for it without losing weight. Thus each greedy choice can belong to an optimum. The rejected edges cost the total minus that optimum, which is the minimum camera cost.

## Complexity

Sorting takes O(M log M). Union-find adds O(M α(N)) time, and storage is O(N + M). The reference accumulates costs in `long long`.

## Common mistakes

- Building a minimum spanning tree and paying for the wrong complement.
- Solving each detected cycle independently, ignoring shared roads.
- Counting rejected edges instead of summing their costs.
- Applying rules for parallel-edge cycles to this platform's explicitly simple graph.
