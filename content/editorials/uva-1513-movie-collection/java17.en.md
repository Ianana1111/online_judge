Use smaller position numbers for higher boxes. Reserve positions 1 through `m` for future move-to-front operations and place initial movie i at `m+i`. A Fenwick tree stores whether each position is occupied, and `position[i]` locates each movie.

The number above a requested movie is the occupied prefix ending at `position-1`. Then subtract its old occupancy, assign the next decreasing reserved `top`, and add occupancy there. No other movie position changes.

Reserve m empty positions before the initial movie stack. Each request moves its movie to the next free top position; a Fenwick tree tracks occupied positions, and the prefix count before its old position is the number above it.
