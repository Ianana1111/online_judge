For a fixed route, its bottleneck is the minimum road capacity. We need the route whose bottleneck is maximum, a widest-path problem.

Use max-min Floyd. Let `capacity[a][b]` be the largest bottleneck using the currently allowed intermediate cities. A path through `via` has bottleneck

`min(capacity[a][via], capacity[via][b])`.

Compare that candidate with the existing value using max. Store roads in both directions and retain the larger capacity among duplicate endpoints. After Floyd, let the best bottleneck be C. The guide leaves `C-1` tourist seats, so the answer is `ceil(T/(C-1))`, computed with quotient plus a nonzero-remainder indicator. If start equals destination, no transport trips are needed.

A trip is limited by the narrowest road on its route. Use max-min Floyd to find the widest bottleneck between source and destination, subtract the guide’s seat, then round up the tourist count divided by that capacity.
