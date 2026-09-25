Testing every possible block character by character can become quadratic. Repetition instead creates an overlap: if a block of length p repeats, shifting the string by p makes a long prefix match a suffix.

The KMP prefix function records the longest proper prefix that is also a suffix for every processed prefix. If its final value is L, then `p = N − L` is the shortest period candidate. A longer border would mean a shorter shift, so choosing the longest border finds the strongest possible overlap.

But overlap alone does not guarantee complete copies. `ababa` has period two in the overlapping sense, yet its final `a` leaves a partial block. Return `N / p` only when p divides N; otherwise return one.

To compute the prefix function, extend the previous border when the next characters match. On a mismatch, try the previous border's own longest border, continuing until a match or zero. Those fallback links avoid rescanning characters from scratch.

With longest matching prefix/suffix length L, the candidate period is n−L; repetition requires that it divide n.
