The vector uses `long long`, so `product *= a[right]` performs 64-bit multiplication throughout. `answer = 0` directly expresses the required fallback when no positive product exists.

`product = 1` belongs inside the left-endpoint loop: it is the neutral value before choosing the first element of a new interval. The right-endpoint loop multiplies before comparing with `answer`, so every considered interval is nonempty. It never resets a negative intermediate product, preserving the possibility that a later negative factor makes it positive.

The outer EOF loop reads each sequence independently, while `tc` supplies consecutive case numbers. The exact case sentence and the two terminating newlines match the required output format.
