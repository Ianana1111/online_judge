# Recover the original number from quotient and remainder modulo nine

## Problem and constraints

Removing the last decimal digit of an at-least-two-digit integer `N` produces `M`. Given `D=N-M`, print every possible `N` in increasing order. `10 <= D <= 10^18`, and zero terminates input. Integer precision is required at this magnitude.

## Building the approach

Write `N=10M+d`, where the last digit `d` lies from zero through nine. Then

`D=N-M=9M+d`.

Let `q=D/9` and `r=D%9`. When `r` is nonzero, the only digit congruent to `D` modulo nine is `d=r`, giving `M=q` and `N=10q+r`.

When `r=0`, two decimal digits share that residue: zero and nine. Digit zero gives `M=q` and `N=10q`. Digit nine gives `M=q-1` and `N=10q-1`. Print the smaller value first.

Use 64-bit integer division throughout; a floating approximation to `10D/9` loses unit precision for large inputs.

## Walkthrough

For `D=18`, `q=2` and `r=0`, producing 19 and 20. Indeed, `19-1=18` and `20-2=18`.

For `D=10`, `q=1` and `r=1`, so the only answer is 11, and `11-1=10`.

## Why it works

The equation `D=9M+d` requires the last digit to be congruent to `D` modulo nine. For residues one through eight, exactly one decimal digit qualifies. For residue zero, exactly digits zero and nine qualify. The algorithm lists all these possibilities and the equation uniquely determines `M` for each, so no solution is omitted.

Substituting every constructed `M,d` into `N=10M+d` makes `N-M=D`, so no invalid number is printed. The explicit ordering in the two-answer case is increasing.

## Complexity

Each input uses `O(1)` time and `O(1)` space. The largest constructed result fits in signed 64-bit `long long`.

## Common mistakes

- Always printing only `10q` and missing the last digit logic.
- Omitting one of the two answers when `D` is divisible by nine.
- Printing those two answers in descending order.
- Using floating-point division at values near `10^18`.
- Storing input in a 32-bit integer.
