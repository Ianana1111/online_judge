`canonical` maps original `(r,c)` to rotated `(c,n-1-r)`. Each loop compares the current orientation then rotates, covering exactly four orientations without reflection.

`seen` starts empty. Move numbering begins at one; on the first repeated key, parity chooses the opponent and saves the losing move. Once `winner` is set, later moves are still read and applied only to preserve input position, and the recorded outcome cannot be overwritten.
