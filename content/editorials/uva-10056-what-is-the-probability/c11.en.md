Let `q=1-p`. Player I wins in the first round with probability `q^(I-1)*p`. Winning one full round later requires N additional failures, multiplying by `q^N`; all later opportunities form an infinite geometric series:

`p*q^(I-1) / (1-q^N)` for positive p.

Directly subtracting `q^N` from one can catastrophically cancel when p is tiny. Use

`1-q^N = (1-q)(1+q+...+q^(N-1))`

and cancel `p=1-q`. The answer becomes `q^(I-1)` divided by the sum of N nonnegative weights. Accumulate these weights iteratively; the denominator starts with one and never suffers near-equal subtraction.

True zero probability remains a separate branch. The input spelling is inspected so an extremely small positive scientific-notation value is not confused with mathematical zero after floating conversion.

Cancel the common infinite-round factor, normalize the first-round failure weights, and handle true p=0 as zero probability.
