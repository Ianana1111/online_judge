# Compare exact text first, then visible characters

## Problem and constraints

This platform uses the CPE-modified rules. Compare the standard output and team output exactly first. If that fails, remove whitespace and compare every remaining visible character. Exact equality is `Accepted`; only visible equality is `Presentation Error`; otherwise verdict is `Wrong Answer`. Also print the standard output's character count including spaces but excluding newlines. Each text has 1 through 99 lines of length at most 120, and empty lines count.

## Building the approach

Read each text as a vector containing exactly its declared number of complete lines. Equality of these vectors checks line count, line boundaries, every character, and every space, exactly matching Accepted.

Only after exact comparison fails, build a visible string for each side by concatenating nonwhitespace characters in order. Unlike the original UVa variant, letters and punctuation matter here; filtering only digits is wrong.

The printed character count is the sum of original standard line lengths. It excludes newline separators but retains spaces and is independent of the team output or visible filtering.

## Walkthrough

Standard `a b` versus team `ab` differs exactly but has equal visible text, so the verdict is Presentation Error and the standard count is three.

Standard lines `ab` and `c` versus one team line `abc` are also Presentation Error, not Accepted. `hello 10` versus `world 10` is Wrong Answer despite matching digits, because visible letters differ.

## Why it works

The line vectors retain all information needed for exact layout equality, so their equality is precisely the first verdict condition. When that fails, removing all whitespace while preserving every other character creates exactly the representation specified by the second condition.

These checks occur in priority order and are mutually exclusive; falling through means neither permitted equality holds. Summing standard line lengths counts every stored character once and no newline, producing the required trailing number.

## Complexity

For total text length L, reading, comparison, and visible extraction are `O(L)` time and `O(L)` space.

## Common mistakes

- Keeping digits only, as in a different problem version.
- Ignoring line boundaries before deciding Accepted.
- Reading words and losing spaces or empty lines.
- Counting filtered text or the team output's length.
- Checking Presentation Error before exact equality.
