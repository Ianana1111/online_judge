# A repeated prefix must tile the entire string

## Problem and constraints

For each nonempty line of at most one million printable characters, find the largest repetition count k such that the entire string equals k copies of a nonempty block. A line containing exactly one period ends input. Other periods and all spaces are data; case matters.

## Building the approach

Testing every possible block character by character can become quadratic. Repetition instead creates an overlap: if a block of length p repeats, shifting the string by p makes a long prefix match a suffix.

The KMP prefix function records the longest proper prefix that is also a suffix for every processed prefix. If its final value is L, then `p = N − L` is the shortest period candidate. A longer border would mean a shorter shift, so choosing the longest border finds the strongest possible overlap.

But overlap alone does not guarantee complete copies. `ababa` has period two in the overlapping sense, yet its final `a` leaves a partial block. Return `N / p` only when p divides N; otherwise return one.

To compute the prefix function, extend the previous border when the next characters match. On a mismatch, try the previous border's own longest border, continuing until a match or zero. Those fallback links avoid rescanning characters from scratch.

## Walkthrough

For `abcabcabc`, the longest border is `abcabc`, length six. The candidate period is 9 − 6 = 3, which divides nine, giving three copies. For `aaaa`, the period is one and the answer four. For `ababa`, five is not divisible by two, so answer one. The line `..` is two copies of `.` and is not the sentinel.

## Why it works

KMP's fallback chain considers exactly the shorter borders that can still extend, so it computes the longest border correctly. A border of length L makes all positions p = N − L apart equal, yielding a period; maximal L makes that period shortest. When it divides N, its equal blocks tile the string and maximize the copy count. A string made of two or more complete copies has a shortest repeating block whose length is also its shortest period, so a shortest period that does not divide N rules out such a tiling.

## Complexity

O(N) time and O(N) space. Border lengths increase by at most one per position, and fallback steps decrease them, giving a linear total number of fallback steps.

## Common mistakes

- Omitting the divisibility check.
- Reading whitespace-delimited tokens instead of full lines.
- Comparing character frequencies instead of ordered characters.
- Stopping on every string containing a period.
- Forgetting that a single-character string has answer one.
