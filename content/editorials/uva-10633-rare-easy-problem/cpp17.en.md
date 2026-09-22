The input loop stores `difference` in `long long` and ends on zero without producing output. Integer quotient `q` and remainder `r` completely replace floating-point approximation or search.

For `r==0`, the program prints `10*q-1` before `10*q`, corresponding to final digits nine and zero. Otherwise `10*q+r` reconstructs the unique prefix and final digit.

All literals combine with the 64-bit variable, and the stated bound keeps multiplication by ten inside range. Each case ends with exactly one newline.
