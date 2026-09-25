Build a directed distance matrix for each graph: zero on the diagonal, one for a listed arc, and infinity otherwise. Run Floyd–Warshall independently on both matrices to obtain all-pairs shortest paths.

For every ordered pair, reject the proposal if its distance is infinite or exceeds `A*old+B`. At the same time, take the maximum entry of the old distance matrix for the required directed diameter. Streets must not be given implicit reverse arcs.

Run Floyd–Warshall separately on the original and proposed directed graphs. Check every ordered source–destination pair against A times the old shortest distance plus B, and compute the maximum old shortest distance.
