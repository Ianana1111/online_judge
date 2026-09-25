Normalize every board as `(shortSide,longSide)` and sort the six pairs. For box edges `x<=y<=z`, the sorted faces must be two copies each of `(x,y)`, `(x,z)`, and `(y,z)`.

First require equality in sorted pairs 0-1, 2-3, and 4-5. Then verify their representative dimensions share one consistent x, y, and z. Three unrelated equal pairs alone are insufficient.

`Arrays.sort` fixes the pair order before checking duplicated faces and shared edges.
