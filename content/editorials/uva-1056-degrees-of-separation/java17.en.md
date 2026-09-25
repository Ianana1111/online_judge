The requested value is the maximum over all-pairs shortest paths, not a longest simple path. Map encountered names to integer IDs and allocate a full `P` by `P` matrix. Set diagonal entries to zero, both directions of every relationship to one, and all other entries to a large infinity.

Run Floyd–Warshall. For each possible intermediate vertex `k`, update

`dist[i][j] = min(dist[i][j], dist[i][k]+dist[k][j])`.

After all intermediates are allowed, scan the entire declared matrix. Any infinity means the network is disconnected; otherwise the largest finite shortest distance is the answer. Rows belonging to unnamed members contain only their diagonal zero and therefore correctly expose them as isolated.

Allocate the distance matrix for every declared person, including unnamed isolated ones. After Floyd–Warshall, any infinite distance means the network is disconnected.
