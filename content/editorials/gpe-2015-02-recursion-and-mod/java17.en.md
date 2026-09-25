The added constant prevents the recurrence from being a pure geometric sequence. Try shifting by a constant `c`: requiring `f(n)+c = 3(f(n-1)+c)` gives `4+c=3c`, so `c=2`.

Define `g(n)=f(n)+2`. Then `g(n)=3g(n-1)` and `g(1)=3`, hence `g(n)=3^n` and `f(n)=3^n-2`.

Compute `3^n mod MOD` with binary exponentiation. Read the exponent one binary bit at a time. When the low bit is one, multiply the current base into the result. Square the base and shift the exponent right each round. Every product is reduced immediately, so only about 63 iterations are needed.

Finally normalize subtraction with `(power-2+MOD)%MOD`, because C++ may return a negative remainder for a negative operand.

Rewrite the recurrence as 3^n−2 and use binary exponentiation instead of linear recursion for large n.
