To locate one character in finite level `n`, the left segment is `F(n-2)` with known length. If position is below that split, descend to `n-2`; otherwise subtract the split and descend to `n-1`. Base levels directly return 0 or 1. Repeat independently for requested positions.

For huge levels, `length(46)=2,971,215,073`, already beyond every valid query index. Whenever `n>=48`, the full query lies in the leading `F(n-2)`, so reducing by two preserves it. Jump directly by parity to 46 or 47; odd and even levels must remain distinct. Store lengths through 47 in 64 bits.

Precompute each string length. To find one position, descend into its left or right component by comparing with the left length; never build the potentially enormous whole string.
