Searching through sequences of moves is unnecessary because the cost depends only on the final row chosen in each column. Instead, ask which legal eight-queens board will be the final board.

Generate every legal target once with backtracking. Process columns from left to right and try each row. Three bit masks record occupied rows, `row + column` diagonals, and `row - column` diagonals. A placement that conflicts with any mask is skipped. When all eight columns are filled, save the board.

For a fixed legal target, a queen costs zero moves if its row already matches and exactly one move otherwise. Thus the cost is the Hamming distance between the input and target arrays. The minimum across all generated targets is the answer.

Generate every legal eight-queens target. For each target, count columns whose rows differ from input, since moving a queen within its column costs exactly one move.
