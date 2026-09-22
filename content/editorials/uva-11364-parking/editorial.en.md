# Visit both extreme shops and return across the interval

## Problem and constraints

Choose one parking point on a straight street, visit all specified shop positions, and return to the same car. Each case has 1 to 20 positions from 0 through 99, possibly repeated. Shopping is one continuous walk; returning to the car after each shop is unnecessary.

## Building the approach

Only the leftmost position `L` and rightmost position `R` matter. Visiting both extremes traverses the entire interval and therefore reaches every shop between them. Park at `L`, walk to `R`, and return to `L`, for distance `2(R-L)`.

No sorting, median, or average is needed. This is a closed route covering an interval, rather than a sum of independent distances from one facility.

## Walkthrough

For positions `24,13,89,37`, the extremes are 13 and 89, so the distance is `2*76=152`. With one shop, park at its door and walk zero. Repeated shops at position 42 also give zero.

## Why it works

Every valid closed walk that visits both `L` and `R` must cross each segment between them at least twice: once while reaching the opposite side and once while returning to its starting point. Thus every solution costs at least `2(R-L)`. Parking at `L`, walking to `R`, and returning attains this bound and visits every intermediate shop, so it is optimal.

## Complexity

One scan finds both extremes in `O(N)` time and `O(1)` extra space.

## Common mistakes

- Printing only `R-L` and forgetting the return journey.
- Following the input order as if it fixed the visiting order.
- Returning to the car after every individual shop.
- Initializing the minimum to zero and adding a nonexistent position.
- Forcing a positive distance for one or several colocated shops.
