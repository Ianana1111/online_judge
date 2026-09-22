The kuti branch recursively prints the quotient before its unit, then reduces `n` to the seven-digit remainder. Each smaller-unit branch prints its quotient and updates the remainder in descending order.

Every fragment includes its own leading space, so no separate first-token flag is needed. `setw(4)` affects only the following case number and uses normal space padding. The caller prints ` 0` for a whole zero input, while `printNumber` omits internal zero values.
