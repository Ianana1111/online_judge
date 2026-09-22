# Keep the factorial's digits explicitly

## Problem and constraints

For each integer N from zero through 1,000, print the sum of the decimal digits of N!. Read until EOF. Although the requested digit sum is small, the factorial itself quickly exceeds built-in integer types. By definition, 0! = 1, so its digit sum is one.

## Building the approach

We cannot recover exact decimal digits from an overflowed integer or a floating-point approximation. Instead, represent the factorial as an array of decimal digits and implement the same multiplication used on paper.

Store the least significant digit first. Starting from the array `[1]`, multiply successively by 1, 2, ..., 1,000. For each digit, compute `digit * n + carry`, keep its remainder modulo ten, and pass its quotient by ten to the next position. After the old digits end, append every remaining carry digit.

There is no need to recompute a factorial for each query. After multiplying by n, sum the digits and save that answer at index n. The factorial array advances only during preprocessing; queries become table lookups.

## Walkthrough

Before multiplying by five, 4! = 24 is stored as `[4, 2]`. The low digit gives 4×5 = 20: write zero, carry two. The next gives 2×5+2 = 12: write two, carry one. Append that one, obtaining `[0, 2, 1]`, which represents 120. Its digit sum is three.

## Why it works

Assume the array represents (n−1)! exactly. At each position, the digit multiplication plus incoming carry is exactly the contribution at that decimal place. Storing its remainder and forwarding its quotient preserves the value of the product. Appending all final carry digits completes n!. Starting from one proves every factorial representation correct; summing its digits gives the requested answer.

## Complexity

With maximum index M = 1,000, n! has O(n log n) digits. Preprocessing takes O(M² log M) small-digit operations. The digit array uses O(M log M) space and the answer table O(M). Each query takes O(1).

## Common mistakes

- Computing the factorial in `long long` before extracting digits.
- Appending only one digit of a multi-digit final carry.
- Forgetting to reset the carry before each multiplication.
- Losing internal or trailing zeros from the representation.
- Using a floating-point factorial to recover exact digits.
