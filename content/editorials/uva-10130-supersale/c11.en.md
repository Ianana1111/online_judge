All members face the same item list and differ only in capacity. Compute one 0/1 knapsack table `best[c]` for every capacity from zero through 30.

For item weight `w` and price `p`, update capacities downward:

`best[c] = max(best[c], best[c-w]+p)`.

Descending order ensures the source state still contains only earlier items, so the current item can enter a person's bag at most once. After processing all items, look up `best[capacity]` for every member and sum the answers.

Do not remove an item after one member uses it: inventories are independent across people. Combining capacities into one large bag is also wrong because capacity cannot transfer between people.

Each person independently has access to the item list. Build one 0/1 knapsack table for capacities 0–30, then sum the lookups. Descending updates prevent reusing an item in one bag.
