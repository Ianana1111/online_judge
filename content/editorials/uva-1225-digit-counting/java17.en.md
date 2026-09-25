The bound is small enough to enumerate every integer. For each `value` from 1 through `N`, copy it to `x`. The remainder `x%10` is its current last digit; increment that digit's counter, then remove it with `x/=10`. Continue until no digits remain.

This procedure sees real internal and trailing zeroes, such as both zeroes in 100, but never invents leading zeroes. Starting from one also avoids counting the standalone number zero, which is not written in the requested sequence.

Print the ten counts in digit order from 0 to 9, not in discovery order.
