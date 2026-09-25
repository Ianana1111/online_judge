First remove floating-point rounding from the problem: parse every amount as an integer number of cents. For total S and n people, the only possible final shares are `low = floor(S/n)` and `high = ceil(S/n)`.

Someone who paid more than high must receive at least the excess. Someone who paid less than low must pay at least the shortfall. Add these required amounts separately, then take their maximum.

Why not just one side? When S is not divisible by n, some people must end at high and others at low. The two unavoidable totals can differ. Choosing a single rounded average can either lose a cent or require more money than exists. Taking the larger lower bound accounts for both sides while allowing the one-cent flexibility.

Parse currency as integer cents. Compute the unavoidable amount above the ceiling and below the floor separately; the larger total is the minimum exchange.
