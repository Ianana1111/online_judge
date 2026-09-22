The distance matrix indexes only the first two jug amounts. When a state leaves the min-priority queue, `amountNow` reconstructs the third using conservation. Queue records whose cost no longer matches the matrix are stale and skipped.

Every finalized state updates `best` for all three of its current amounts. The nested `from` and `to` loops generate six directed possibilities; zero-volume transitions are ignored, while every other edge adds exactly the poured amount to cost.

The final descending loop stops at the first recorded amount. Output order is cost followed by volume, and zero-cost initial amounts are naturally included.
