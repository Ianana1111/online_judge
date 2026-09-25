Colors are completely determined by bar position, so choose only the widths: `K` positive ordered integers, each at most `M`, summing to `N`.

Let `ways[bars][total]` count sequences using exactly `bars` widths with the given total. The unique empty sequence gives `ways[0][0]=1`. For a nonempty sequence, classify by its final width `width` from one through `M`; the preceding bars must form `total-width`. Therefore

`ways[bars][total] = sum ways[bars-1][total-width]`.

Widths begin at one because a zero-width bar would disappear and change the number of bars.

`ways[0][0] = 1` seeds the empty prefix; widths must be positive and no greater than M.
