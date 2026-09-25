The index can exceed two billion, so advancing through the sequence one term at a time is too slow. We need a way to double an index in constant work. If `a=Fk` and `b=F(k+1)`, Fibonacci identities give

`F(2k) = a * (2b-a)` and `F(2k+1) = a^2+b^2`.

This suggests a recursive function that returns the adjacent pair `(Fn,F(n+1))`. It first obtains the pair for `floor(n/2)`, applies the two doubling identities, and chooses the correct adjacent pair according to whether `n` is even or odd.

Every operation may be reduced modulo `2^m`, because addition and multiplication preserve congruence. The expression `2b-a` needs normalization before the C++ remainder operator is used. When `m=0`, the modulus is one, so even the base value for `F1` must be stored as `1 % mod = 0`.

Return the adjacent pair (Fₙ,Fₙ₊₁). Recurse on n/2, then apply doubling identities. When m=0 the modulus is one, so reduce the base F₁ too.
