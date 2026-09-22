The game of Spot is played on an N × N board as shown below for N = 4. During the game, alternate
players may either place a black counter (spot) in an empty square or remove one from the board, thus
producing a variety of patterns. If a board pattern (or its rotation by 90 degrees or 180 degrees) is
repeated during a game, the player producing that pattern loses and the other player wins. The game
terminates in a draw after 2N moves if no duplicate pattern is produced before then.

Consider the following patterns:

![Five example 4×4 board patterns](/problem-images/uva-141-the-spot-game.png)

If the first pattern had been produced earlier, then any of the following three patterns (plus one
other not shown) would terminate the game, whereas the last one would not.

### Input

Input will consist of a series of games, each consisting of the size of the board, N (2 ≤ N ≤ 50)
followed, on separate lines, by 2N moves, whether they are all necessary or not. Each move will consist
of the coordinates of a square (integers in the range 1..N ) followed by a blank and a character '+' or '-'
indicating the addition or removal of a spot respectively. You may assume that all moves are legal, that
is there will never be an attempt to place a spot on an occupied square, nor to remove a non-existent
spot. Input will be terminated by a zero (0).

### Output

Output will consist of one line for each game indicating which player won and on which move, or that
the game ended in a draw. See the Sample Output below for the exact format.


### LOCAL 盤面歷史規則

盤面歷史從第一個完成操作後開始記錄，開局尚未落子的空盤不預先加入。操作後第一次出現空盤時正常記錄，之後與先前完成操作的任何盤面相同或旋轉相同，才會觸發重複。旋轉包含零、九十、一百八十及二百七十度，不含鏡射。此規則與本平台既有測資一致。
