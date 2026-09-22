# Precompute one 0/1 knapsack table for every family capacity

## Problem and constraints

Each item has a price and weight. Every family member may take each item at most once, but different members may independently take the same item. Maximize the sum of each member's carried value under that member's capacity. There are up to 1,000 items, 100 family members, and all capacities are at most 30.

## Building the approach

All members face the same item list and differ only in capacity. Compute one 0/1 knapsack table `best[c]` for every capacity from zero through 30.

For item weight `w` and price `p`, update capacities downward:

`best[c] = max(best[c], best[c-w]+p)`.

Descending order ensures the source state still contains only earlier items, so the current item can enter a person's bag at most once. After processing all items, look up `best[capacity]` for every member and sum the answers.

Do not remove an item after one member uses it: inventories are independent across people. Combining capacities into one large bag is also wrong because capacity cannot transfer between people.

## Walkthrough

With one item worth ten and weighing five, two members each with capacity five contribute ten each, totaling twenty. They independently access the same item type.

One member with capacity ten still obtains only ten because the item is 0/1, even though another copy would fit by weight.

## Why it works

Before an item, `best[c]` is the optimum using earlier items within c. An optimum after adding the item either excludes it and keeps the old value, or includes it once alongside an old solution at capacity `c-w`. Descending updates keep that source free of the current item, so the recurrence is exact by induction.

Family members have no shared stock restriction, so all independently optimal selections can coexist. Summing their table lookups therefore gives the maximum family value.

## Complexity

With maximum capacity 30, time is `O(30N+G)` and extra space is `O(30)`.

## Common mistakes

- Updating capacities upward and creating unlimited copies.
- Sharing one finite item inventory among family members.
- Taking only the best single member instead of summing.
- Combining all capacities into one bag.
- Swapping price and weight during input.
