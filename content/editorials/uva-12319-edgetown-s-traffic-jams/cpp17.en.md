`readGraph` uses `getline` because each adjacency row begins with its source and has a variable number of destinations. It sets only `g[u][v]`, preserving direction, initializes diagonal zeroes, and returns an independently completed Floyd matrix.

The finite sentinel is well above any legal shortest path and remains safe under addition, while validation still tests proposal infinity explicitly. `diameter` is updated only from `old`; once `valid` becomes false it is never restored. The output follows this platform's `Yes/No` plus old-diameter contract.
