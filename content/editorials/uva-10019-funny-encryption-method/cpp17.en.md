The input remains a string so its exact digit spelling can feed both interpretations. `decimal` and `hexadecimal` are reset for each case and differ only in their positional multiplier.

`bits` adds remainders that can only be zero or one, then removes each low bit with integer division. Its argument is passed by value, so bit extraction cannot alter either parsed integer. Output follows `b1 b2` order with one space and no extra encryption value.
