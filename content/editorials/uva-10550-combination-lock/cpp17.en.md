`start` and `a,b,c` retain the four input positions. The sentinel test requires all four to be zero, so valid codes containing zero are processed.

The three named distance variables make each direction explicit. Every raw difference lies between -39 and 39; adding 40 before taking `% 40` therefore yields exactly a nonnegative partial turn below one revolution.

`ticks` starts with the fixed 120 and then adds all partial movements. Multiplication by nine produces an exact integer number of degrees, requiring no floating-point arithmetic.
