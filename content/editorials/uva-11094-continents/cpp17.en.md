The `flood` lambda shares `grid`, `land`, and `seen` with the surrounding case and returns the number of newly visited cells. A cell is marked when it enters the queue, preventing duplicate insertions even when a one-column map makes left and right point back to the same place.

Only the column coordinate is normalized with modulo; the row coordinate receives a normal bounds check. The first returned size is deliberately discarded to remove the king's continent. Later floods are compared with `answer`, and formatted input naturally skips blank lines between cases until EOF.
