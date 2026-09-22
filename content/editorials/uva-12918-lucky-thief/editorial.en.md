# Sum worst-case eliminations and match them with an adversarial lower bound

## Problem and constraints

`N` keys open distinct doors among `M`, with `1<=N<=M<=100000`. Find the minimum number of trials guaranteed in the worst case to determine every pairing. The last remaining possible door may be inferred without testing. Up to 100,000 cases require a constant-time 64-bit formula.

## Building the approach

For the first key, at most `M-1` failures identify the final door. Remove that matched door; the next key needs at most `M-2`, continuing through `M-N`. This achievable strategy costs `(M-1)+...+(M-N)=N(2M-N-1)/2`.

For optimality, view possible assignments as matchings in a complete bipartite graph. An adversary answers failure whenever deleting that tested edge still leaves some complete matching. Identification requires a unique matching; such a graph has at most `N(N+1)/2` edges, so at least `NM-N(N+1)/2` failed edge deletions can be forced, equal to the formula.

## Walkthrough

For `N=4,M=6`, worst-case counts are 5,4,3,2 for a total of 14. For one key and two doors, one failure identifies the other. With one key and one door, zero trials suffice. At `N=M=100000`, the answer exceeds 32 bits.

## Why it works

Sequential elimination proves the formula is attainable. For the lower bound, unmatched doors cannot retain incident edges in a unique-matching graph, and contracting matched edges leaves a directed graph with no cycle, since a cycle would permit rotating assignments into a second matching. A DAG has at most `N(N-1)/2` extra edges plus `N` matching edges. Therefore the adversary can preserve ambiguity until exactly the stated number of individual tested edges have been removed, so no strategy guarantees fewer trials.

## Complexity

Each case takes `O(1)` time and space. The multiplication uses signed 64-bit arithmetic.

## Common mistakes

- Testing the final inferable door.
- Giving every key `M-1` trials despite removed matched doors.
- Computing an average rather than a worst-case guarantee.
- Overflowing a 32-bit product.
- Dividing odd `N` before multiplication.
