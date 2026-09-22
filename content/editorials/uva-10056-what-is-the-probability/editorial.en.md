# Replace infinite rounds with stable finite geometric weights

## Problem and constraints

`N` players repeatedly attempt in order. Every attempt succeeds independently with probability `p`, and the first success wins. Find the eventual winning probability of player `I`. Up to 1,000 cases have `N<=1000`, `1<=I<=N`, and `0<=p<=1`; print four decimals. When `p=0`, nobody ever wins, so every player's probability is zero rather than `1/N`.

## Building the approach

Let `q=1-p`. Player I wins in the first round with probability `q^(I-1)*p`. Winning one full round later requires N additional failures, multiplying by `q^N`; all later opportunities form an infinite geometric series:

`p*q^(I-1) / (1-q^N)` for positive p.

Directly subtracting `q^N` from one can catastrophically cancel when p is tiny. Use

`1-q^N = (1-q)(1+q+...+q^(N-1))`

and cancel `p=1-q`. The answer becomes `q^(I-1)` divided by the sum of N nonnegative weights. Accumulate these weights iteratively; the denominator starts with one and never suffers near-equal subtraction.

True zero probability remains a separate branch. The input spelling is inspected so an extremely small positive scientific-notation value is not confused with mathematical zero after floating conversion.

## Walkthrough

For two players and `p=0.4`, weights are 1 and 0.6. Their total is 1.6, giving player one `0.6250` and player two `0.3750`.

At `p=1`, only the first weight is nonzero and player one wins with certainty. With one player and any positive p, numerator and denominator are both one, so eventual victory probability is one.

## Why it works

For positive p, `q<1`, so the infinite series over full failed rounds converges to the stated formula. The finite geometric identity and cancellation are algebraically exact, changing only numerical stability.

During iteration, the weight for player `j` is `q^(j-1)`. `total` sums every player's weight and `target` captures player I's term, so their ratio equals the derived probability. The separate `p=0` branch follows the game's no-winner behavior.

## Complexity

Each case takes `O(N)` time and `O(1)` space. No infinite-round simulation is performed.

## Common mistakes

- Counting only the first round.
- Using exponent I instead of `I-1`.
- Applying the canceled formula at `p=0` and returning `1/N`.
- Computing `1-q^N` directly for extremely small p.
- Treating a tiny positive scientific-notation input as zero.
- Truncating the game after a fixed number of rounds.
