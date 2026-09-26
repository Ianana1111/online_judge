Six connected squares do not necessarily fold into a cube: two squares may land on the same face. Track each square's orientation after folding.

Represent orientation as (u,v,n): its right direction, downward direction, and face normal. Encode coordinate axes as 1,2,3 and their opposites as −1,−2,−3, avoiding full vector arithmetic. Give an arbitrary starting square orientation (1,2,3). Crossing right produces (−n,v,u); left gives (n,v,−u), down gives (u,−n,v), and up gives (u,n,−v). Visualize a ninety-degree fold to see which axis stays fixed.

BFS propagates these orientations through adjacent paper squares. Record a square's orientation on first arrival. A later arrival by another route must produce the same three directions; otherwise folding is inconsistent.

Require all three conditions: all six squares are reached, every orientation is consistent, and the six face normals are distinct. The last check is essential to reject overlapping faces. Six distinct normals occupy exactly the cube's six faces. Each case examines at most 36 cells and their neighbors, so time and space are constant. Separate answers with a blank line.
