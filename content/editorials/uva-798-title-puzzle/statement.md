In a puzzle a rectangular surface of width w and height h is split into a collection of rectangular tiles.
The tiles with the same dimensions form a similarity group. Solving the puzzle is to rebuild the surface
by using the tiles from the collection. There can be many solutions. Two solutions are considered
different if the tiles from at least one similarity group follow different placement patterns in the two
solutions. For example, in the puzzle from figure 1 there are two groups of two similar tiles each. The
tiles can be combined in eleven different ways to solve the puzzle.

![Two groups of similar tiles combined to rebuild a surface, eleven ways](/problem-images/uva-798-title-puzzle.png)

*Figure 1: Combining tiles to rebuild a surface*

Write a program that for a given puzzle, as described above, computes the total number of different
solutions of the puzzle. The puzzle surface and the tiles have integer dimensions.

### Input

The program reads sets of data from a text file. Each data set, that describes a puzzle, has the format
w h n m<sub>1</sub> w<sub>1</sub> h<sub>1</sub> . . . m<sub>n</sub> w<sub>n</sub> h<sub>n</sub>, where 0 \< w, h ≤ 100 are the dimensions of the surface to be rebuild,
0 \< n ≤ 10 is the number of groups of similar tiles, m<sub>k</sub> is the number of similar tiles in the k-th group
and w<sub>k</sub> h<sub>k</sub> are the width and the height of the tiles in the k-th group. Input data are correct, i.e. the
tiles can be always combined to rebuild the surface and all tiles must be used in the process.

### Output

For each set of data, the program writes the number of tile combinations on a separate line.

Note: The first data set in the sample below corresponds to the puzzle shown in figure 1.


### LOCAL platform resource limits

This platform restricts total board area to w*h<=20 and at most20 puzzles per input file. The original dimension bounds and at most10 similarity groups still apply. Tiles may rotate90degrees; shapes equivalent under rotation belong to the same similarity group, listed only once. Counts and tile dimensions are positive integers, every tile must be used, and a solution is guaranteed. The area restriction is local, not part of the original PDF.
