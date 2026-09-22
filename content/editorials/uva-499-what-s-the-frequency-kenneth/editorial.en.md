# Count one line, then emit every maximum-frequency letter in fixed order

## Problem and constraints

For every input line, print all ASCII letters with the highest frequency, followed by one space and that frequency. Uppercase and lowercase are distinct. Output order is `A` through `Z`, then `a` through `z`; digits, punctuation, and spaces do not count. This platform defines a line with no letters to have an empty letter list and frequency zero, so its output begins with one space followed by `0`.

## Building the approach

Use full-line input so each line remains one case. Count only codes in the uppercase or lowercase ASCII ranges, updating the current maximum after each increment. Reinitialize both counts and maximum for every line.

After counting, scan an explicit 52-character alphabet string in the required order and print every character whose count equals the maximum. Require the maximum to be positive; otherwise all 52 absent letters have count zero and must not be printed.

Separating counting from ordered output naturally retains every tie, including a letter that reaches the maximum later in the line.

## Walkthrough

In `Hello Howard.`, `H`, `l`, and `o` each occur twice, so output is `Hlo 2`. For `AAaaBBbb`, uppercase `A,B` and lowercase `a,b` all tie at two and appear as `ABab 2`. The line `123 !?` has no letters and produces an empty list followed by ` 0`.

## Why it works

Every legal letter increments exactly its own case-sensitive counter, while every other character is ignored, so the table holds exact frequencies. Updating the maximum on each increment yields the largest table entry. Scanning all legal letters in the required fixed order prints precisely every positive entry equal to that maximum. When no letters exist, the positive guard prints none and the retained maximum zero matches the platform rule.

## Complexity

For line length `L`, counting plus the fixed alphabet scan takes `O(L+52)` time. The count table uses `O(1)` space apart from the input line.

## Common mistakes

- Merging uppercase and lowercase counts.
- Counting digits or punctuation.
- Printing only the first maximum and dropping ties.
- Using first-appearance order instead of the required alphabet order.
- Printing every zero-count letter on a letterless line.
