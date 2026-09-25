Scan in chronological order and maintain frequencies of values already seen in a Fenwick tree. For current value `x`, the prefix query through `x` is exactly the number of earlier values no greater than `x`. Add it to the answer, then insert today's value.

Keeping duplicate frequencies makes every earlier equal day count separately. Querying before updating excludes the current day without a special case.

Insert prices one by one and query prior values at most the current price with a Fenwick tree; ties count too.
