Original `rows` and `columns` remain unchanged for output; separate `shorter` and `longer` values drive classification. Zero and one-row cases are direct, while the two-row formula handles full four-column blocks and its clipped remainder.

Ordinary boards compute ceiling half as `(rows*columns+1)/2`. The loop stops only when both dimensions are zero, allowing a single zero dimension to produce zero. The fixed output wording is used even for singular numeric values, as required by the problem format.
