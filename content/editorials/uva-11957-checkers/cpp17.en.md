Reading finds `W` and initializes its ways entry. The board stays unchanged because movement never returns to the original row. A candidate first represents a one-step move; seeing `B` shifts it one further, after which a shared validation checks the final landing.

Rows descend from `n-1` through 1, leaving top-row cells terminal. Jumps still point to unprocessed smaller rows. Every addition and the final top-row sum use the specified modulus, and case formatting matches the judge.
