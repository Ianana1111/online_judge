Every query resets to `male=0,female=1` and runs exactly n transitions. `nextMale` and `nextFemale` both read the old variables before either is assigned back.

The wide unsigned type handles values near the allowed `2^32` boundary; it does not imply arbitrary larger years are part of the specification.

The input condition excludes only negative `-1`, so year zero prints the initial state without entering the loop. Output fields are male and `male+female` separated by one space.
