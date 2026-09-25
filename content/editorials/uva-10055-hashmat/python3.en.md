The story asks only for the difference in army sizes. Either order may appear, so the answer is `abs(a - b)`. Checking two small examples in opposite orders makes this clear before writing code.

Split the input on whitespace and process each pair until EOF. Python integers can represent the inclusive `2^32` bound, and `0 0` correctly produces zero.
