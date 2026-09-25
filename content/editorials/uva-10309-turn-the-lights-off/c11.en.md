Treating all one hundred buttons independently would suggest `2^100` possibilities. Instead, work from top to bottom. Nothing above the first row can determine its presses, so enumerate its 1024 possible press masks. After that choice, every later row is forced.

Once we finish deciding presses in row `r`, any light still on in that row can only be fixed by pressing the cell directly below it. Returning to earlier rows would disturb already settled lights, and no other later button reaches row `r`. Therefore the remaining state of row `r` is exactly the press mask required for row `r+1`.

Store each board row as a ten-bit mask. For a current press mask, its effect within the row is the mask itself plus its left and right shifts; the previous row's presses supply the vertical effect from above. XOR these effects with the original light mask to derive the next required mask. After processing the tenth row, a nonzero requirement for an imaginary eleventh row means the chosen first row is impossible.

Enumerate the 1,024 possibilities for the first row. Every remaining lit cell in a row forces the press directly below it, so later rows are determined. Keep the smallest press count among choices that leave no lights on.
