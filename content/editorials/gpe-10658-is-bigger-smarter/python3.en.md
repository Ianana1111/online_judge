Sorting by weight puts every possible predecessor before its successor. It does not make equal weights legal: the transition must still check both strict inequalities.

Let `length[i]` be the longest chain ending at sorted elephant i. A single elephant always works, so start at one. For every earlier j with smaller weight and larger intelligence, try extending its best chain to length `length[j] + 1`.

The task asks for the chain itself, not just its length. Whenever a transition improves the value, save j as `previous[i]`. Choose the best ending elephant, follow predecessors backward, and reverse the collected original IDs. Keep the original ID attached during sorting; a sorted array index is not an output ID.

Sort by weight, then extend only a predecessor with strictly lower weight and higher intelligence. Save predecessor links to reconstruct original input IDs.
