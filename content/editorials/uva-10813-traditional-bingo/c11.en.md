Instead of rescanning the card after every call, record `called[number]`, the one-based time when each number is announced. For any winning line, completion occurs when its last required square is called, so its completion time is the maximum of its five square times.

The card has five rows, five columns, and two diagonals. Compute the maximum time for each and take their minimum. Represent the free center internally by zero and leave `called[0]=0`, meaning it was marked before the game.

All 75 announcements must still be read, even if the mathematical answer occurs early, so the next test case remains aligned.

Treat the center free cell as time zero; a line completes at the maximum call time among its cells, then take the earliest line.
