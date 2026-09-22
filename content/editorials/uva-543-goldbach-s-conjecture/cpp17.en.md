The prime table covers indices 0 through 999999, every legal query and complement. Multiples begin at `p*p` because smaller multiples already have a smaller prime factor; loop bounds consistently stay below `limit`.

`answer = 0` safely represents no pair because a legal smaller prime is at least three. Breaking on the first match preserves minimum `a`, and computing `n-answer` ensures the sum remains exact. The failure string includes its required apostrophe and period, and `answer` is reset for every query.
