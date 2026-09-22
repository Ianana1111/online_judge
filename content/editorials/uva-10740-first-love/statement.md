Abul is not the best student in his class; neither is he the best player in his team. Not that he is bad;
he is really good, but unfortunately not the best.

Last semester our "not quite the best" Abul took a course on algorithms. In one of the assignments he was required to find the shortest
path from a given vertex x to another vertex y in a weighted directed
graph. As you have probably already guessed, he rarely managed to
find the shortest path; instead he always ended up finding the k-th
(2 ≤ k ≤ 10) shortest path from x to y. If he was fortunate enough
and the shortest k paths from x to y had the same length, he was given
credit for his solution.

For example, for the graph on the right, Abul was asked to find the
shortest path from vertex 5 to vertex 2.

![Weighted directed graph with 5 vertices (1-5) and 5 labeled edges forming a pentagon](/problem-images/uva-10740-first-love.png) The shortest 7 paths from
vertex 5 to vertex 2 are listed below in non-decreasing order of length.
For this graph Abul was able to find the 5-th shortest path which could
be either 5 → 4 → 3 → 2 → 5 → 1 → 2 or 5 → 1 → 2 → 5 → 4 → 3 → 2, each with length 15.

| Path | Length |
|---|---|
| 5 → 1 → 2 | 5 |
| 5 → 4 → 3 → 2 | 6 |
| 5 → 1 → 2 → 5 → 1 → 2 | 14 |
| 5 → 4 → 3 → 2 → 5 → 1 → 2 | 15 |
| 5 → 1 → 2 → 5 → 4 → 3 → 2 | 15 |
| 5 → 4 → 3 → 2 → 5 → 4 → 3 → 2 | 16 |
| 5 → 1 → 2 → 5 → 1 → 2 → 5 → 1 → 2 | 23 |

Given a description of the graph, source vertex x, target vertex y, and the value of k, you need to
find out the length of the path Abul computed. You may assume that there exists at least one path
from x to y in the given graph.

### Input

The input may contain multiple test cases.

The first line of each test case contains two integers n (2 ≤ n ≤ 100) and m (1 ≤ m ≤ 1000) giving
respectively the number of vertices, and the number of edges in the graph. Each vertex in the graph
is identified by a unique integer in [1, n]. The second line of the test case contains the values of x, y
and k (1 ≤ x, y ≤ 100, x ≠ y, 2 ≤ k ≤ 10). Each of the next m lines contains three integers u, v and l
(1 ≤ u, v ≤ 100, 0 ≤ l ≤ 10000) specifying a directed edge of length l from vertex u to vertex v.

The input terminates with two zeros for n and m.

### Output

For each test case in the input output a line containing an integer giving the length of the k-th shortest
path in the graph. If the graph does not have at least k paths from x to y, output a '-1' instead.

### LOCAL platform clarification

Paths in this task are directed edge-walks: vertices and edges may be revisited, including leaving the target and returning later. Equal lengths count with multiplicity. Each input edge is distinct, so parallel edges give distinct edge-walks. Zero-length edges and cycles are allowed.
