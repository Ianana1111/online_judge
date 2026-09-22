`dieSeen` and `pipSeen` have the same dimensions but independent meanings. The first BFS marks at enqueue time and stores every cell of that die, preventing duplicate queue entries and limiting the later scan to one component.

The second layer increments only at an unseen `X`, then marks its entire four-neighbor `X` region. Both BFS loops share the same four directions and boundary helper. Results stay in a vector, are sorted, and are printed with position-controlled spaces plus the required blank line after each throw.
