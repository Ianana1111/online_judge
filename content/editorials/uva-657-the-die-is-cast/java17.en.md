Use two four-neighbor BFS passes. The first starts at an unseen non-background pixel and crosses both `*` and `X` to collect a whole die. The second starts at each unmarked `X` within that die and crosses only `X`; each launch counts one pip.

Encode a cell as `row * width + col` and use integer-array queues, avoiding many coordinate objects. Maintain separate boolean visited tables for dice and pips. Sort all die counts and print them in the required format.
