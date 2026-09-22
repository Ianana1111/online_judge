The queue stores `(row, col, phase, moves)`. The flattened key `(row * c + col) * 3 + phase` assigns three separate visited states to each cell. The start is marked immediately with phase zero.

For one candidate direction, `nr` and `nc` begin at the current location and advance one cell at a time. A wall or boundary failure invalidates the entire move. Only after all required steps succeed does the program construct the endpoint key using `nextPhase`.

Visited states are marked when enqueued, preventing duplicate queue entries while preserving shortest-distance order. The exit check occurs when a complete state is popped; intermediate cells never trigger it. Each successful transition adds one to `moves`, independent of its physical length.
