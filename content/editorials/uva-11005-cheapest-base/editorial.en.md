# Evaluate the digit-printing cost in every base from 2 through 36

## Problem and constraints

Printing digit symbols `0-9` and `A-Z` has 36 supplied costs. For every decimal query from zero through two billion, list all bases 2 through 36 whose representation has minimum total symbol cost, in increasing order. There are no leading zeroes, but zero itself is represented by one `0`. Print a blank line between test groups.

## Building the approach

Only 35 bases exist, so compute every one. For base b, repeatedly take `x%b` to obtain the least significant digit value, add its symbol cost, and set `x/=b`. The order of digits does not affect the sum, so no representation string or reversal is needed.

Use a do-while loop so number zero still processes one digit zero. Reset x from the original query for every base.

Maintain `best` and a list of tied bases. A strictly smaller total replaces the best and clears the list; an equal total appends the base. Enumerating bases upward keeps the list sorted.

## Walkthrough

If every symbol costs one and the query is ten, base two costs four symbols and base ten costs two. Every base 11 through 36 represents ten with one symbol, so all of them tie for minimum.

For query zero, every base prints the same one digit `0`, so all bases 2 through 36 are answers.

## Why it works

Integer division satisfies `x=b*(x/b)+(x%b)`, so each iteration extracts exactly one base-b digit and removes it. Repetition processes every nonleading digit, while the do-while handles zero's single digit. Thus each computed sum is the exact printing cost.

After each base, the maintained list contains precisely all examined bases at the current minimum: lower cost resets it, equal cost adds to it, and higher cost changes nothing. After base 36, it is the complete optimal set.

## Complexity

Each query costs `O(35(1+log V))` digit operations and `O(1)` auxiliary space.

## Common mistakes

- Keeping only the first tied base.
- Stopping before base 36.
- Failing to clear old bases after discovering a lower cost.
- Reusing x after it was divided to zero for a previous base.
- Mishandling zero or the required blank line between groups.
