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

The Python version groups cases with equal bottle count and initial total value so they can share a compact array cache; the one-unit count is inferred from the remaining value. Try the five payment-and-change transitions and minimize inserted coins plus future cost.
