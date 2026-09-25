For the first key, at most `M-1` failures identify the final door. Remove that matched door; the next key needs at most `M-2`, continuing through `M-N`. This achievable strategy costs `(M-1)+...+(M-N)=N(2M-N-1)/2`.

For optimality, view possible assignments as matchings in a complete bipartite graph. An adversary answers failure whenever deleting that tested edge still leaves some complete matching. Identification requires a unique matching; such a graph has at most `N(N+1)/2` edges, so at least `NM-N(N+1)/2` failed edge deletions can be forced, equal to the formula.

Compute the full product in `long`; halving an odd key count first would truncate it.
