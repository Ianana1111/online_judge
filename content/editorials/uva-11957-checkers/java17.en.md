Every move decreases the row by one or two, so states form a DAG. Let `ways[r][c]` count paths from the start to that cell. Initialize the white square to one and process rows bottom to top.

For each direction, inspect the adjacent diagonal. If it is outside, no move exists. If empty, move one step. If black, shift once more in the same direction and accept only an in-bounds nonblack landing. Add current ways to the destination modulo the required value. Do not extend top-row states; sum them as mutually exclusive destinations. A white checker already on top contributes its zero-move path.

Every move goes to a higher row, so the board is a DAG. Propagate route counts from bottom to top; when the adjacent diagonal cell is black, jump only if the cell beyond it is empty and inside the board.
