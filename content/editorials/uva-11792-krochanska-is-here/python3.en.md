For every line, add undirected edges only between consecutive listed stations. Use a fresh per-line seen array when counting station appearances, so repetition within one line does not create false importance. Collect stations whose distinct-line count exceeds one.

Run BFS from each important candidate because every graph edge has equal time. Sum distances only to important stations. Multiplication by two and division by the common number of other important stations affect every candidate equally, so comparing raw distance sums is sufficient. Examine candidates by ID and update only on a strictly smaller sum to preserve the smallest tie.

Deduplicate stations within each route to identify those appearing on multiple routes. BFS from every important station and sum distances only to other important stations; scanning candidates in station order resolves ties toward the smaller number.
