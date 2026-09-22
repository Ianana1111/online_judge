# Enumerate reliable sets and enforce only their statements

## Problem and constraints

Up to 20 informants make as many as 800 claims that another person is reliable or unreliable, possibly about themselves. Every reliable speaker must tell the truth; an unreliable speaker may say either truth or falsehood. Find the largest possible number of reliable people. With no claims, everyone can be reliable.

## Building the approach

Represent a candidate reliable set by a bitmask. For each speaker, combine all positive targets into one mask and all negative targets into another. Only if the speaker is included as reliable must every positive target also be included and every negative target be excluded.

Enumerate all `2^n` masks and retain the maximum population passing these tests. A candidate no larger than the current best cannot improve it and may be skipped. Reaching `n` is globally optimal and permits early termination.

## Walkthrough

If person 1 says person 2 is both reliable and unreliable, person 1 cannot be reliable, but unrelated silent people may still be reliable. If the sole person claims they are unreliable, including them contradicts their claim, so the best is zero. Marking them unreliable imposes no requirement that their statement be false.

## Why it works

For a chosen mask, complete containment of a reliable speaker's positive mask and disjointness of their negative mask are exactly the truth conditions for every claim they made. Unreliable speakers impose no constraints, so passing these checks is equivalent to feasibility of that assignment. Exhaustive mask enumeration covers every possible assignment, and selecting maximum popcount therefore yields the optimum. Skipping masks too small to improve the incumbent is safe.

## Complexity

Building masks takes `O(A)`. Enumeration takes `O(n2^n)` time and `O(n)` mask storage.

## Common mistakes

- Forcing unreliable speakers to lie.
- Enforcing statements from every speaker regardless of reliability.
- Checking only some positive targets rather than all.
- Declaring all assignments impossible after a contradictory speaker.
- Excluding the valid all-unreliable assignment.
