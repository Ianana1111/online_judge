`directions="NESW"` and matching delta arrays share one index. Left rotation adds three instead of subtracting one, avoiding negative C++ remainder.

The scent array is initialized once, while `lost` resets per robot. Candidate coordinates are committed only when legal. A new loss marks the last valid cell and breaks; a scented loss attempt changes nothing and command processing continues. `getline` preserves even an empty instruction line.
