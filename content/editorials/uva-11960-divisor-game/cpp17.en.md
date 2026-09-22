Queries are stored while `limit` tracks the actual maximum, sizing arrays only as needed. Each divisor loop begins at itself and visits all multiples.

`record=1` handles the minimum prefix. The `>=` comparison is essential because increasing scan order makes current `n` the larger tied candidate. `best` stores every prefix record, and saved query order is preserved for output.
