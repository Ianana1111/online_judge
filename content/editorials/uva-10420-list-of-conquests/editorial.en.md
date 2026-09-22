# Count the first word of each record with an ordered map

## Problem and constraints

After a record count, every input line contains a one-word country name followed by a woman's full name, which may contain several words. Count records per country and print countries in alphabetical order. Records, rather than distinct personal names, are counted, and each line has length at most 75.

## Building the approach

Treat each physical line as one record. Parse only its first word as the country; the remaining name does not affect classification. Increment that key in an ordered `map<string,int>`.

Reading complete lines is important. If the whole file were consumed as a stream of words, the second or third word of a name could be mistaken for the country of the next record. Assuming every name has a fixed word count would fail for the same reason.

An ordered map keeps its country keys lexicographically sorted, so a final traversal already has the required output order.

## Walkthrough

For records beginning `Spain`, `England`, and `Spain`, the counts become two for Spain and one for England. Ordered output prints `England 1` before `Spain 2`, regardless of first-appearance order.

If two input lines contain the same country and identical name text, they are still two records and both increments remain.

## Why it works

By the input contract, the first word of each record is exactly its country. The algorithm increments exactly that country's counter once for every line. Induction over processed records shows that each stored value equals the number of records belonging to its key.

Each distinct country occupies one map entry, and ordered traversal visits those entries in increasing lexicographic key order. Therefore every country is printed once with the correct count and ordering.

## Complexity

For `N` records and `K` distinct countries, map updates take `O(N log K)` plus time to read the input text. Stored keys and counts use `O(K)` space; names need not be retained.

## Common mistakes

- Using the entire line, including the person's name, as the map key.
- Assuming names contain a fixed number of words.
- Deduplicating repeated names even though the task counts records.
- Printing by first appearance or by count instead of country name.
- Forgetting to consume the newline after the initial record count.
