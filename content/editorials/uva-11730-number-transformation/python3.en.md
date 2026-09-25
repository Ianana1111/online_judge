View each integer as a vertex and every legal addition `A -> A+p` as a unit-cost directed edge. BFS then finds the minimum moves. Since every factor is positive, values only increase; ignore transitions above `T`, and `S>T` naturally remains unreachable.

To list distinct prime factors, trial-divide from 2, record a divisor once, and remove all of its powers. Any remaining factor above one is prime, but include it only if it is smaller than original `A`; equality means `A` itself was prime and is forbidden. Mark distances upon enqueueing to avoid repeated states.

Each proper prime-factor addition is a unit-cost graph edge, so BFS finds the minimum steps. Extract distinct prime factors smaller than the current value; primes have no outgoing edges.
