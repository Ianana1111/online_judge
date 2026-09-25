Write `N=10M+d`, where the last digit `d` lies from zero through nine. Then

`D=N-M=9M+d`.

Let `q=D/9` and `r=D%9`. When `r` is nonzero, the only digit congruent to `D` modulo nine is `d=r`, giving `M=q` and `N=10q+r`.

When `r=0`, two decimal digits share that residue: zero and nine. Digit zero gives `M=q` and `N=10q`. Digit nine gives `M=q-1` and `N=10q-1`. Print the smaller value first.

Use 64-bit integer division throughout; a floating approximation to `10D/9` loses unit precision for large inputs.

`divmod` gives quotient and remainder together; zero remainder is the special two-solution case.
