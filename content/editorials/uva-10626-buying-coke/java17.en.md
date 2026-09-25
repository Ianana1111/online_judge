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

Store only remaining bottles and counts of five- and ten-unit coins; infer one-unit coins from the remaining total value. Try the five relevant payment-and-change transitions and minimize inserted coins plus future cost.
