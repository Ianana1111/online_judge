### Store the effect, not the whole matrix

While reading cell `(i,j)`, the program XORs its bit into both `rows[i]` and `columns[j]`. These accumulators stay either zero or one; ordinary counts would work too, but would keep information we never use.

The next loop records the indices of all odd rows and columns. First check whether both lists are empty: an already-correct matrix should print `OK`, rather than being forced through the repair branch. Next check whether both list sizes are exactly one. Their saved indices identify the intersection, and adding one converts internal zero-based indices into the required coordinates.

All remaining patterns print `Corrupt`. The outer `while (cin >> n && n)` processes every matrix and stops at the zero sentinel. Arrays are recreated for each matrix, so parities cannot leak from one case into the next.
