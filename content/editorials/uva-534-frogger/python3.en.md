Let `best[v]` be the smallest known squared bottleneck from stone zero to `v`. Initialize the source to zero and all others to infinity. Repeatedly select the unused vertex `u` with minimum `best`, then consider traveling through it to every unused `v`.

Extending the path changes its bottleneck to

`max(best[u], squaredDistance(u,v))`.

Use this value when it improves `best[v]`. This is Dijkstra under minimax path composition: alternatives still take a minimum, but a path extension takes a maximum rather than a sum. Because square root is increasing, all comparisons remain exact integer squared distances; take one square root only for final output. Stop when vertex one becomes settled.

A route costs its largest jump rather than the sum of jumps. In Dijkstra-style relaxation, extend a route with max(current bottleneck, new squared distance), then retain the minimum among routes.
