# Buy higher base prices earlier and guard every integer power

## Problem and constraints

Land with initial price `L` costs `2*L^t` when bought in year `t`, beginning at year 1, and one land is bought per year. Find minimum total cost, printing `Too expensive` only when it exceeds 5,000,000; equality is affordable. Each case has fewer than 40 distinct positive prices.

## Building the approach

Larger base prices suffer more from a later, larger exponent, so sort prices descending and assign years 1,2,... in that order. Then compute each exact integer power and accumulate twice it.

Only whether the budget is exceeded matters. Before multiplying power by the price, compare against `budget/2/price`; if larger, that term is already unaffordable. Read unrestricted-size price tokens digit by digit and cap them at `budget+1`, preserving the conclusion that they are too expensive without overflowing. Consume the entire case before evaluating it.

## Walkthrough

Prices 7,2,10 become 10,7,2, costing `2*10 + 2*7^2 + 2*2^3 = 134`. Input order would cost 2022. A single price 2,500,000 costs exactly 5,000,000 and is accepted; 2,500,001 is rejected.

## Why it works

For `x>=y>=1` assigned to years `t<s`, placing `x` earlier rather than later reduces cost by `2[(x^s-x^t)-(y^s-y^t)]`, which is nonnegative because delaying a larger positive base increases its power at least as much. Repeatedly swapping inversions yields descending order without increasing cost. The guarded arithmetic stops only after proving a term or total strictly exceeds budget, so it never rejects an affordable optimum.

## Complexity

Sorting takes `O(N log N)`. Direct powers take `O(N^2)` multiplications for `N<40`, with `O(N)` storage.

## Common mistakes

- Buying cheapest land first.
- Starting years at exponent zero.
- Using floating-point `pow` near the budget boundary.
- Multiplying until overflow before comparing.
- Rejecting exactly 5,000,000.
- Stopping input consumption when expense is already known.
