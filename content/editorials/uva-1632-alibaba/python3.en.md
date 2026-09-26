Walking past a coin collects it instantly, so collected coins always form a contiguous interval. Track only interval endpoints and which end currently holds the traveler, not arbitrary subsets.

For the current interval length, left[l] and right[l] are the earliest completion times ending at that interval's left or right endpoint. A single coin starts at time zero, unless its deadline is nonpositive. Sentinel −1 marks an impossible state.

Extend to left endpoint l either from the old left endpoint of [l+1,r] or by crossing from its right endpoint; extending right is symmetric. Accept arrival only strictly before the new coin's deadline. Of two valid arrivals, keep the earlier: at the same endpoint with the same collected interval, earlier can never harm future choices.

Process increasing interval lengths and scan l left-to-right. Old l+1 states remain available and old l states are read before overwrite, requiring O(n) storage. Basic time is O(n²). C widens intermediate distances to 128 bits. Java checks the remaining deadline before adding and detects overflowing sorted-coordinate subtraction, preventing signed-long wraparound.

Python additionally intersects necessary starting-position reachability intervals. An optimum may start at its first collected coin: removing travel before that first collection only helps. Every route must cover the full span plus travel from its start to the nearer endpoint. If a complete endpoint sweep meets every deadline and exactly attains this lower bound, return it immediately; otherwise execute the full interval DP. This certificate never guesses feasibility.


Python stores only intervals with at least one feasible endpoint, extending each by one coin on either side. An interval with neither endpoint feasible cannot become useful later, so omitting it is exact. Tight deadlines and few feasible starts often leave very few intervals instead of forcing a dense scan of impossible states. Worst-case bounds remain O(n²) time and O(n) states per layer.


Also discard endpoints that arrived legally but cannot possibly reach a remaining coin. Coins left of the interval require time<min(deadline[i]+position[i])−current position; right-side coins require time<min(deadline[i]−position[i])+current position. Prefix/suffix minima test these necessary conditions in O(1) per endpoint. Passing them does not claim feasibility: DP continues. Failing them safely excludes an impossible completion.
