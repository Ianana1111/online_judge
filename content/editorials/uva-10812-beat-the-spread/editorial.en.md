# Solve the score sum and difference as two linear equations

## Problem and constraints

Given the nonnegative total score `s` and absolute score difference `d`, print two nonnegative integer scores with the larger first, or lowercase `impossible` if no such scores exist. The statement gives no tight magnitude bound, so exact integer arithmetic is appropriate.

## Building the approach

Let the higher score be `a` and lower score `b`. Then

`a+b=s` and `a-b=d`.

Subtracting gives `2b=s-d`, so `b=(s-d)/2` and `a=s-b`. A valid integer solution requires `s>=d` to keep b nonnegative and `s-d` even to avoid a half point.

When both conditions hold, `a=b+d>=b`, so the values are already ordered. If either fails, the linear system's unique solution is invalid and no alternative pair exists. Zero scores remain legal.

## Walkthrough

For `s=40,d=20`, the lower score is ten and the higher is thirty. For `s=20,d=40`, the lower result would be negative. For `s=5,d=2`, it would be 1.5. Both latter cases are impossible.

For `s=7,d=7`, the solution `7 0` is valid and must not be rejected merely because one team scored zero.

## Why it works

Every valid score pair necessarily satisfies `2b=s-d`, proving the nonnegative and parity conditions necessary. When they hold, the constructed integers sum to s, differ by d, and satisfy `a>=b>=0`, proving sufficiency.

The two independent equations have a unique solution, so rejecting an invalid construction cannot overlook another pair.

## Complexity

Each case takes a constant number of exact integer operations and `O(1)` working space, aside from buffered input.

## Common mistakes

- Checking parity but allowing a negative lower score.
- Checking only `s>=d` and truncating a half-integer result.
- Rejecting valid zero scores.
- Printing the smaller score first.
- Using floating point and losing precision on large integers.
