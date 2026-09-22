# Match each required character as early as possible

## Problem and constraints

For two strings s and t containing ASCII letters and digits, decide whether deleting some characters from t can produce s. Kept characters must retain their order but need not be consecutive. Case matters. Read whitespace-separated pairs until EOF and print `Yes` or `No`.

## Building the approach

Substring search is too restrictive: `ab` can be obtained from `axb` even though it is not a contiguous block. Character counts alone are too permissive: `ba` cannot be obtained from `ab`.

Keep a pointer to the next character needed from s. Scan t from left to right. When its current character matches that required character, advance the pointer; otherwise discard it. At the end, success means the pointer reached the end of s.

Why accept the earliest match without trying later ones? Choosing an earlier occurrence leaves at least as much remaining text for all later required characters. Delaying a match cannot create an opportunity that the earlier choice would lose. This is the greedy property that makes backtracking unnecessary.

## Walkthrough

For s = `ab` and t = `axb`, match `a`, skip `x`, then match `b`, giving Yes. For `ba` against `ab`, the first required `b` is found only at the end, leaving no later `a`, so answer No. `aa` against `a` fails because one position cannot be reused, and lowercase `a` does not match uppercase `A`.

## Why it works

Compare greedy match positions with any valid subsequence positions. The first greedy position is no later than the first valid one. If that holds through one character, the next valid position still lies to the right of the greedy position, so the next greedy match is also no later. Induction proves that greedy cannot fail when a valid subsequence exists. If it succeeds, its increasing matching positions themselves form a valid subsequence.

## Complexity

O(|t|) matching time and O(1) extra state. Reading and storing both strings requires O(|s| + |t|) time and space; dynamic strings avoid an unstated fixed buffer limit.

## Common mistakes

- Searching only for a contiguous substring.
- Ignoring case or checking only character frequencies.
- Reusing one target position multiple times.
- Indexing s after the entire string is matched.
- Returning success after matching only its first character.
