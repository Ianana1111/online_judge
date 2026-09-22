The zero-initialized matrix is updated symmetrically, and `max` preserves the best parallel road. `best[start] = 10001` represents an unconstrained zero-edge route; the first relaxation immediately reduces it to a legal road capacity.

Selection considers only unsettled cities and chooses the maximum label. If that maximum is zero, no remaining positive-capacity route exists. The update first takes the route bottleneck with `min`, then compares alternatives with `max`. Output preserves scenario numbering, the `tons` suffix, and a blank line after each case.
