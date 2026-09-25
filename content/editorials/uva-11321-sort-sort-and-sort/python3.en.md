Translate the priority list directly into a comparator. Compute the signed remainders first; if they differ, compare them ascending. Only when they match, determine parity. If one value is odd and the other even, put the odd value first. Finally compare two odd values descending or two even values ascending.

Test oddness with `value % 2 != 0`, because a negative odd number has remainder `-1` in C++, not 1. Every return must be a strict comparison. Equal values should compare false rather than using `<=` or `>=`, which would violate the ordering contract required by `sort`.

Print each `N M` header before checking the sentinel, while checking the sentinel before any modulo operation so division by zero never occurs.

Sort by C-style signed remainder, then odd before even, then descending odd or ascending even value. Python needs explicit signed-remainder conversion for negatives.
