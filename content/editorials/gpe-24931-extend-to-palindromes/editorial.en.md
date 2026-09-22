# Preserve the longest palindromic suffix

## Problem and constraints

For each nonempty case-sensitive letter string of length up to 100,000, append characters only at the end to obtain the shortest palindrome. Existing characters cannot be changed and nothing may be prepended. A string already palindromic must remain unchanged.

## Building the approach

Some suffix of the original string will sit in the middle of the completed palindrome without needing newly appended partners. That suffix must itself be palindromic, and preserving a longer suffix means appending fewer characters. Therefore find the longest palindromic suffix.

Let `r` be the reverse of `s`. Compute the KMP prefix function on `r + '#' + s`, where `#` cannot occur in the input. The final prefix value is the longest prefix of `r` equal to a suffix of `s`. A prefix of `r` is the reverse of the corresponding suffix of `s`, so equality holds exactly when that suffix is a palindrome.

If its length is `L`, take the unmatched prefix `s[0:n-L]`, reverse it, and append it.

## Walkthrough

For `abac`, the longest palindromic suffix is `c`. Reverse the unmatched `aba` and append it, producing `abacaba`.

For `abba`, the whole string is the suffix and nothing is appended. For `xyz`, preserve `z` and append `yx`, producing `xyzyx`.

## Why it works

Write `s=u+v` where `v` is a palindrome. Then `u+v+reverse(u)` is a palindrome, so every palindromic suffix gives a valid construction. In any append-only palindrome, the part of the original string not paired with new characters must be a palindromic suffix; fewer appended characters require a longer such suffix.

The KMP border condition identifies exactly the longest suffix equal to its own reversal, hence the longest palindromic suffix. Appending the reverse of the remaining prefix is therefore valid and minimal.

## Complexity

Reversal, prefix-function construction, and output take `O(N)` time and `O(N)` space.

## Common mistakes

- Finding a palindromic prefix, which corresponds to prepending.
- Comparing borders without reversing one side.
- Appending the entire reversed string unnecessarily.
- Omitting a separator or choosing an input character as one.
- Adding characters to an already palindromic string.
