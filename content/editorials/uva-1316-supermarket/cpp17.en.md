Products are stored as `(deadline,profit)`, so default pair sorting processes deadlines first. `greater<int>` makes `selected` a minimum heap. Each insertion increases `total`, and an actual capacity violation removes and subtracts the heap minimum.

Only one removal can be necessary per iteration because the previous selection was feasible. The program prints the profit total, not job count. EOF alone ends input; an empty product vector naturally leaves the heap and total at zero and prints a valid zero result.
