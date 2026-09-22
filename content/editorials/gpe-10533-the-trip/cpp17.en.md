Each two-decimal monetary string is split at the decimal point. Parsing the dollar and cent substrings as integers produces exact cents without floating-point conversion. `expenses` and `sum` use `long long`.

Integer division computes `low`; `(sum + n - 1) / n` computes `high`. The variable names `give` and `receive` describe two required totals, but it is safer to read their formulas: `give` sums amounts above high, and `receive` sums shortfalls below low. Neither represents the whole transfer amount by itself in every case.

`max(give, receive)` implements the proved minimum. Division by 100 prints dollars, and the remainder prints cents with `setw(2)` and zero filling. Only the final presentation returns to dollar notation.
