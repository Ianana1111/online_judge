The output for one cell sometimes depends on another cell far away: an untouched mine must be revealed if the player touched any mine elsewhere. Printing while discovering the loss can therefore leave earlier mines incorrectly hidden.

Split the work into two passes. First determine one global Boolean, `lost`, by checking whether any cell is both touched and mined. Then decide what to print for every cell using that completed information.

The order of the display rules matters. If the game is lost and this cell is mined, print a star. Otherwise, if it is untouched, print a dot. Every remaining cell is touched and safe, so count its eight neighbors, excluding positions outside the board.

First detect whether any mine was opened; if so, reveal every mine. Count eight neighbors only for opened safe cells.
