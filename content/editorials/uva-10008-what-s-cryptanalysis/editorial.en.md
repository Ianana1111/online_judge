# Count letters, then sort by frequency and alphabet

## Problem and constraints

The first integer declares exactly `N` following text lines, including possible empty lines. Count ASCII letters only, treating upper and lower case as the same letter. Print only letters that occur, in decreasing frequency; ties use increasing alphabetical order. Output letters are uppercase. Spaces, digits, and punctuation do not count.

## Building the approach

Use a 26-element count array. Read complete lines rather than whitespace-delimited words, because empty lines still consume one of the declared inputs. For each character, map lowercase ASCII to uppercase, then increment only if it lies from `A` through `Z`.

Create an index list 0 through 25 and sort it with two keys: larger count first, then smaller index first. Walk that order and print entries whose count is positive.

The explicit tie key matters; first appearance order is unrelated to the required alphabetic order.

## Walkthrough

For lines `bA!` and `a B c`, A and B each appear twice and C once. Output is `A 2`, `B 2`, `C 1`. Even though lowercase b was encountered first, A wins the frequency tie alphabetically.

If every line contains only digits and punctuation, no letter lines are printed.

## Why it works

Every ASCII letter maps to exactly one array position independent of case and increments it once. Every nonletter fails the range test. Thus the array contains exactly the required frequencies.

The comparator's primary key is descending count and its secondary key is ascending letter index, matching the statement. Filtering zero entries then prints all and only letters that appeared, in the correct order.

## Complexity

For total text length `L`, counting takes `O(L)`. Sorting 26 fixed entries takes constant bounded work; storage is `O(26)` plus one input line.

## Common mistakes

- Reading words and losing empty-line accounting.
- Counting upper and lower case separately.
- Omitting the alphabetical tie-breaker.
- Printing letters with zero frequency.
- Treating the newline after `N` as the first text line.
