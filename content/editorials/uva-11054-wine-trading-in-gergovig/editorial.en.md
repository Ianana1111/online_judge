# Sum the required net flow across every street boundary

## Problem and constraints

Houses lie in order along a unit-spaced street. Positive `a_i` is demand to buy, negative is supply to sell, and the total is zero. Moving one bottle across one neighboring-house edge costs one unit of work. Find the minimum total work for up to 100000 houses.

## Building the approach

Consider the boundary after house i. Let prefix balance `S_i=a_1+...+a_i`. If positive, the left side must receive exactly that many net bottles from the right; if negative, it must send `-S_i` out. Therefore every solution pays at least `abs(S_i)` work across that edge.

Scan left to right, update the signed balance, and add its absolute value to the answer at each boundary. The final total balance is zero, so including its final absolute value adds nothing.

Do not replace balance itself by its absolute value; its sign is needed when later supply and demand cancel.

## Walkthrough

For `5,-4,1,-3,1`, prefix balances are 5,1,2,-1,0. The four street edges carry at least 5,1,2,1 bottles, totaling nine work units.

A bottle traveling from first to last crosses several edges and is counted once at each, exactly matching its distance cost.

## Why it works

Conservation on the houses left of any cut forces the cut's net flow to equal their prefix imbalance. Thus the sum of absolute prefix balances is a lower bound for every trading plan.

Sending bottles along each edge in the direction and amount prescribed by these balances satisfies each house because differences of adjacent flows equal its demand. No opposing flows waste work, so the lower bound is attainable and therefore optimal.

## Complexity

Time is `O(N)` and extra space `O(1)`. The work total requires 64-bit storage.

## Common mistakes

- Summing individual absolute demands and ignoring distance.
- Taking absolute value only after the final total, which is zero.
- Sorting houses and destroying their positions.
- Replacing signed balance by its magnitude.
- Accumulating work in 32 bits.
