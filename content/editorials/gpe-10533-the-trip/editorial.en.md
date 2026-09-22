# Balance whole cents without forcing one rounded average

## Problem and constraints

Up to 1,000 travelers have paid different expenses, each at most $10,000. Exchange money so their final shares differ by at most one cent, and minimize the total amount transferred. Amounts are given in dollars and cents; zero travelers ends input. A transfer is counted once, not once at each endpoint.

## Building the approach

First remove floating-point rounding from the problem: parse every amount as an integer number of cents. For total S and n people, the only possible final shares are `low = floor(S/n)` and `high = ceil(S/n)`.

Someone who paid more than high must receive at least the excess. Someone who paid less than low must pay at least the shortfall. Add these required amounts separately, then take their maximum.

Why not just one side? When S is not divisible by n, some people must end at high and others at low. The two unavoidable totals can differ. Choosing a single rounded average can either lose a cent or require more money than exists. Taking the larger lower bound accounts for both sides while allowing the one-cent flexibility.

## Walkthrough

For $10, $20, and $30, transfer $10 from the first traveler to the third; the final burden is $20 each. For expenses of 0, 0, and 2 cents, low is zero and high is one. The below-low total is zero, but the above-high total is one, so one cent must move. For 0, 0, and 1 cent, no transfer is needed.

## Why it works

Every legal final share lies between low and high, so both summed amounts are lower bounds on transferred money. To attain the larger bound, assign the high shares to the people with the largest original expenses and low shares to the rest, using exactly `S mod n` high shares. This retains as much of their original payment as possible; the resulting total excess and deficit coincide and equal the larger bound. Settling those excesses and deficits therefore achieves the minimum.

## Complexity

O(n) time and O(n) stored expenses. All calculations use integer cents, and output converts back to dollars only at the end.

## Common mistakes

- Multiplying a binary floating-point amount by 100 and truncating.
- Rounding everyone to one common average.
- Adding the receiving and paying totals, counting transfers twice.
- Using only one lower bound.
- Omitting the two-digit cents padding.
