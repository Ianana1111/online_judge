# Keep the most profitable feasible jobs with a minimum heap

## Problem and constraints

Each product takes one time unit to sell and earns its profit only when completed no later than its deadline. With up to 10,000 products, maximize total profit. Cases continue to EOF, and `n=0` is a valid case that must print zero.

## Building the approach

Sort products by increasing deadline. Maintain a minimum heap of profits selected so far and their running total. Insert each product. If the selected count now exceeds the current deadline, there are too few available slots, so remove the smallest profit.

Because prior selections fit the previous, no-later deadline and one product was added, at most one removal is needed. The remaining products can be scheduled in deadline order; an exact-deadline completion remains valid.

## Walkthrough

For `(profit,deadline)` values `(50,2),(10,1),(20,2),(30,1)`, the two deadline-one products force removal of 10. By deadline two, inserting 20 and 50 eventually removes 20, leaving profits 30 and 50 for total 80.

## Why it works

Among jobs processed through deadline `d`, feasibility requires no more than `d` selected unit jobs. If insertion violates that capacity, every feasible subset must discard something; discarding the smallest current profit loses the least value and restores feasibility. The nested deadline capacities permit exchanging any discarded low-profit job with a retained higher-profit one without harming schedulability. Induction therefore preserves an optimal feasible subset after every product.

## Complexity

Sorting and heap operations take `O(n log n)` time and the heap uses `O(n)` space.

## Common mistakes

- Rejecting a job when selected count equals its deadline.
- Removing the largest rather than smallest profit.
- Choosing by profit without checking deadline capacity.
- Treating the deadline as processing duration.
- Using `n=0` as a terminator.
