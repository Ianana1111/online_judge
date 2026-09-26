Separate route planning from purchase selection. Roads determine minimum travel costs between stores, so first compute all-pairs shortest paths with Floyd–Warshall. Convert money into exact integer cents rather than floating-point values.

Several DVD offers may belong to the same store. Once there, taking all its discounts adds no travel cost, so combine those offers. At most 12 useful stores remain.

Define best(mask,current) as the maximum additional savings when the stores in mask have been visited and we stand at current. The simplest choice is returning home, giving the negative return cost. Alternatively, visit an unvisited store: gain its discount, pay the travel cost, and add the best continuation. Each transition grows mask, and memoization avoids repeated work.

Start at best(0,home). A nonpositive result means staying home is best. Never omit the return journey or overwrite offers at a shared store. C/C++ use decimal integer strings and Java uses BigInteger because the statement does not bound monetary magnitudes. With V road vertices and K offer stores, time is O(V³+2^K K²) and space O(V²+2^K K), excluding integer lengths.
