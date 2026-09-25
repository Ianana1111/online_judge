Scan coefficients from highest degree to lowest. Skip zeros and keep a boolean `first` indicating that no real term has been printed.

For the first nonzero term, print nothing for a positive sign and only `-` for a negative sign. For later terms, print either ` + ` or ` - `. Once the sign is handled, work only with the coefficient magnitude. Print the magnitude when the degree is zero or it differs from one. Print `x` for every positive degree and append `^degree` only above degree one.

Separating the connector from the term body avoids combinations such as `+ -` and keeps the unit-coefficient exception from incorrectly removing a constant one. If `first` remains true after all nine coefficients, print zero.

Skip zero coefficients and track whether a nonzero term has already been printed to choose sign spacing. Omit magnitude one before a variable, and print 0 only when every coefficient vanishes.
