A direct formula must handle six sides and several boundary offsets. The input limit is small enough to avoid that complication: generate all labels in order once, then answer by lookup.

The useful invariant is the last position of the previous ring. Before ring r starts, it is `(r−1,0)`. Move once by `(0,1)` to the first cell of the new ring. Then follow the six directions `(-1,+1), (-1,0), (0,-1), (+1,-1), (+1,0), (0,+1)`.

The first direction takes only r − 1 further steps because the initial step already entered the ring. Every other direction takes r steps. The total is `1 + (r−1) + 5r = 6r`, and the walk ends at `(r,0)`, ready for the next ring. Save a coordinate whenever a step receives a new label.

Walk hexagonal rings in order. After entering radius r, take r−1 further steps on the first side and r on each other side, recording each label’s coordinate.
