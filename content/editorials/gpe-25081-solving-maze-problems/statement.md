You are asked to navigate a maze. Initially, you are placed at a certain position (the starting position)
in the maze and is asked to try to reach another position (the goal position). Positions in the maze will
either be open or blocked with an obstacle. Positions are identified by (x,y) coordinates.
There are some rules in this problem:
1. The size of a maze map size is 10 x 10.
2. The starting and the goal positions can be anywhere in the map.
3. At any moment, you can only move 1 step in one of 4 directions. Valid directions are: East, West,
South, North.
4. You can only move to positions without obstacles and must stay within the maze.
5. You have to mark the solution path with ‘+’ in the maze, and DO NOT mark the path which
does not lead to the goal position.
6. If there is no solution path, just output “No solution”.

### Technical Specification

To make this problem more concrete, we will consider the maze represented by a matrix of characters.
A maze includes:
1. A starting position: ‘S’, position where you start.
2. A goal position: ‘G’, goal position.
3. Obstacles: ‘#’, positions where you cannot move to.
4. Open positions: ‘.’, positions where you can move to.
5. Footprints: ‘+’ , footprints you made.
Note that each of an input maze has only one solution path.

### Output

There is an empty line at the end of output.

### LOCAL platform clarification

Each input contains exactly one10-by-10 maze with one S and one G. If a solution exists, its simple path is unique; unsolvable mazes are allowed. Replace every cell of that path, including S and G, by +, as in the existing sample.
