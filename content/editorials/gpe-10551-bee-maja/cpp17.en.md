The coordinate vector is value-initialized, so entry 1 already stores the center `(0,0)`. `label`, `x`, and `y` describe the last visited cell.

The `step` lambda moves first, increments the label, and stores the new coordinate only when the label is within `limit`. This lets the final ring finish without an out-of-bounds write. The outer ring loop stops once enough labels have been generated.

The first `step(0,1)` enters the next ring. The direction loop then uses `ring - 1` steps for direction zero and `ring` steps for the other directions, matching the ring-length argument. The query loop simply prints the saved pair until EOF; it does not repeat the spiral for each input.
