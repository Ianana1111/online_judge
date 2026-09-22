# Choose each consensus column independently by maximum frequency

## Problem and constraints

Given 4 through 50 DNA strings of equal length up to 1,000 over A,C,G,T, produce a string minimizing total Hamming distance to all inputs. Among optimal strings choose the lexicographically smallest, then print it and the total mismatch count.

## Building the approach

Hamming cost separates by column. If a column chooses character c, exactly `m-count[c]` rows mismatch, so choose a maximum-frequency character independently in every column.

For ties, examine letters in lexicographic order A,C,G,T and update only for a strictly greater frequency. This preserves the earliest tied letter and therefore the lexicographically smallest complete optimum.

## Walkthrough

For column A,C,A,G, choosing A creates two mismatches while any other creates at least three. If A,C,G,T each occur once, every choice costs three but A is required. Four constant strings AAAA,CCCC,GGGG,TTTT therefore yield consensus AAAA and error 12.

## Why it works

Total distance is the sum of independent column costs. Any solution using a nonmaximum-frequency character in some column can lower its cost by changing only that column, so columnwise maxima are globally optimal. Among maximum choices, taking the smallest at every position makes the first possible differing position smallest, yielding the lexicographically smallest optimal string.

## Complexity

Counting all columns takes `O(mn)` time and storing input takes `O(mn)` space. The result uses `O(n)` space.

## Common mistakes

- Updating on `>=` and choosing a larger tied letter.
- Using a nonlexicographic alphabet order.
- Restricting the answer to one input DNA string.
- Adding matches instead of mismatches.
- Reusing counts across columns.
