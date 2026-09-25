Let `D[i][j]` be minimum cost to transform the first `i` source characters into the first `j` target characters. The final operation is one of:

- delete `x[i-1]`: `D[i-1][j]+1`;
- insert `y[j-1]`: `D[i][j-1]+1`;
- align the last characters: `D[i-1][j-1]` plus one when different.

Take the minimum. Empty source to `j` characters costs `j`, and `i` characters to empty costs `i`. Each row depends only on the previous row and its completed left neighbor, so retain two rows.

Edit distance considers deletion, insertion, and matching or replacing the final character. Keep only two DP rows, and avoid consuming a nonexistent string token when either declared length is zero.
