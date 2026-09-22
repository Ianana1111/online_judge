The line-based parser respects blank lines between cases. It reads the garage coordinates because they belong to the input, although the Euler-circuit argument means their numeric values do not enter the total-length formula.

Each street contributes `hypotl(x2-x1, y2-y1)` to a `long double` sum. The factor `6/1000` combines both lanes, meters-to-kilometers conversion, and hours-to-minutes conversion. Rounding occurs only once with `floorl(minutes + 0.5L)`.

The rounded total uses `long long` to cover the large coordinate bounds. Integer division and remainder by 60 produce hours and minutes. `setw(2)` with zero filling formats the minute field, and the fill character is reset afterward.
