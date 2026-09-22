The input token is split as text, preserving the original fractional length even for `1.0100`. Concatenating whole and fractional parts gives the exact integer coefficient, and Python's `**` computes its exact power without a floating or Decimal context.

`places` multiplies fractional length by the exponent. `zfill` guarantees enough digits on both sides of the point; fractional zeros and then a terminal point are removed in order. `lstrip('0')` applies last and the fallback handles the complete-zero text defensively. Main input splitting accepts the original fixed-column leading spaces.
