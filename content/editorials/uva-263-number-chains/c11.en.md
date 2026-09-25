Insert the original value into a seen set. At each step, convert current to its ordinary decimal string, sort ascending for low, reverse for high, compute next, increment length, and print the equation. Only after printing, stop if next is already seen; otherwise insert it and continue.

Starting with the original makes fixed points stop after one subtraction. Counting one per subtraction equals the number of distinct processed current values, including the initial one.

Sort digits descending and ascending, subtract, and stop when the result has appeared before; count that final subtraction in the chain length.
