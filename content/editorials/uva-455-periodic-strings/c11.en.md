Try candidate lengths `k` from 1 through `n`. Complete repetition requires `k` to divide `n`; skip every other candidate. For a divisor, position `i` must equal the corresponding template character `text[i % k]`. If every position matches, the first `k` characters repeat to form the whole string.

The first successful candidate is minimal because lengths are tested in increasing order. The divisibility check is essential: `ababa` resembles a period-two pattern but ends with only half of another copy, so two is not a valid period.

Try candidate periods from shortest upward; a period must divide length and every position must match its first-period counterpart.
