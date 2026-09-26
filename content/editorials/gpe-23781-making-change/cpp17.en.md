Exact payment is not always optimal: overpaying and receiving change may use fewer coins overall. Divide amounts by five cents, giving denominations 1,2,4,10,20,40. Let own[p] be the minimum bounded-wallet coins paying p and shop[c] the minimum unlimited-shop coins returning c. Minimize own[p]+shop[p−price] over p≥price.

First construct an actual payment and compute its total coin count budget. No optimal answer needs more than budget coins, and no coin exceeds forty units, so 40·budget is a sufficient payment bound. Clip each wallet stock to budget rather than allocating by an enormous wallet total. Descending denominations provide the initial crossing payment; an unlimited change DP completes its budget.

Since the price is at most ninety-nine units, the first crossing payment is at most 138 units and its change at most 39. That gives a safe total-count bound of 177 even before the tighter budget is computed; larger stock values can be clipped while parsing.

Split bounded stocks into binary-sized groups with value denomination·quantity and cost quantity. Update own downward so a group cannot be reused. Update shop by increasing amount. Parse the decimal price as integer cents without floating point, and preserve the required output width of three.
