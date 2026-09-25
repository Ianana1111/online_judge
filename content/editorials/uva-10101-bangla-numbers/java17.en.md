Process largest units first. If `n` contains kuti, recursively format `n/10,000,000`, print `kuti`, then continue with the remainder. Recursion is necessary because the quotient itself may still contain one or more kuti groups.

Within the remaining seven-digit block, extract lakh, hajar, and shata in descending order. Print a coefficient and unit only when the coefficient is nonzero, then reduce to the remainder. Print a final nonzero value below one hundred directly.

Handle an input value of zero in the caller. Internal zero remainders should print nothing, whereas the complete number zero must print one zero.

Split off kuti recursively because large inputs can require repeated kuti. Decompose the remaining seven digits into lakh, hajar, and shata; handle a whole-input zero separately.
