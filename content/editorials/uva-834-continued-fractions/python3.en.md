Input values are consumed in numerator-denominator pairs. A negative denominator causes both signs to flip without changing the rational. `divmod` avoids floating point and stays exact for huge integers, negative first terms, and values near integers.

Each quotient is appended before replacing the pair with denominator and remainder. A zero remainder ends the loop before any division by zero. Formatting always writes the first coefficient followed by a semicolon; joining an empty remainder list naturally yields `[b0;]`. A zero numerator becomes `[0;]`.
