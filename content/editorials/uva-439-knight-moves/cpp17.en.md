Subtracting `'a'` and `'1'` converts each file and rank to indices from zero through seven. `dx[d]` and `dy[d]` are paired offsets and must use the same direction index.

The `distance` array serves both as the visited marker and shortest-distance storage. A neighbor is assigned when enqueued, so it never enters the queue twice. Short-circuit evaluation checks coordinates before accessing `distance[nx][ny]`. Output reuses the original square strings, avoiding any error while converting indices back to chess notation.
