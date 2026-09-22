The month-length array begins with January at index zero. Loop variable `m` runs over completed one-based months and reads `days[m-1]`, while `offset` starts at `day-1`.

The weekday array explicitly fixes names and capitalization, with Saturday at index five. Modulo seven always produces a valid index and cases may arrive in any date order independently.
