# Memoize wallet states and keep all five useful payment forms

## Problem and constraints

Each coke costs eight. The wallet contains coins of value one, five, and ten; change is returned immediately using the minimum number of coins and may be reused. Buy `C<=150` cokes while minimizing the total number of coins inserted. The initial total value is sufficient. A payment with the fewest coins now is not always globally optimal because its change affects later purchases.

## Building the approach

After removing redundant payments, five forms are needed:

- eight ones, costing eight inserted coins;
- one five and three ones, costing four;
- two fives, receiving two ones, costing two;
- one ten, receiving two ones, costing one;
- one ten and three ones, receiving one five, costing four.

The last conversion can be worthwhile because it creates a five for later.

Memoize `(remaining, fives, tens)`. If the initial value is `V` and `B` bottles have been bought, current wallet value is fixed at `V-8B`. Therefore ones are uniquely

`V-8B-5*fives-10*tens`,

and do not need their own state dimension. Try every affordable payment, add its inserted-coin count, and recurse with one fewer bottle.

Ten-coin count never increases. Each spent ten can create at most one five, so the five dimension need not exceed initial fives plus initial tens.

## Walkthrough

For two cokes with two ones, one five, and one ten, first pay the ten and receive two ones. The wallet now has four ones and one five. Pay five plus three ones for the second coke. Total inserted coins are one plus four, or five.

A state with a ten and three ones must also consider paying thirteen and receiving a five; discarding that transition can make later purchases unnecessarily expensive.

## Why it works

An optimal payment need not insert 18 or more: a value-ten subset can be withheld, reducing current inserted coins, and later substitutes for the returned ten without increasing total insertions. Among payments from eight through seventeen, canceling any denomination both inserted and returned leaves exactly the five listed normal forms. Thus at least one optimal plan uses only enumerated transitions.

Every purchase reduces total wallet value by exactly eight, so the conservation formula recovers the omitted ones count. Remaining bottles strictly decrease, making the state graph acyclic. By induction on `remaining`, taking the minimum legal first-payment cost plus the optimal memoized suffix yields the global minimum.

## Complexity

With initial fives `F` and tens `T`, there are `O(C(F+T)T)` states and five transitions per state. Time and memo space have the same asymptotic bound.

## Common mistakes

- Greedily choosing the fewest coins for only the current bottle.
- Omitting the ten-plus-three-ones conversion into a five.
- Failing to return change to the wallet.
- Assuming the number of fives never increases.
- Adding ones as an unnecessary independent DP dimension.
