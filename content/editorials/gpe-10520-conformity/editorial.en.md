# Normalize each course set before counting it

## Problem and constraints

Each of at most 10,000 students chooses five distinct courses numbered 100 through 499. Two students have the same combination when their course sets match, regardless of input order. Count all students belonging to the most popular combinations, including every combination tied for first. An input count of zero terminates processing.

## Building the approach

The first task is to define a reliable identity for a combination. The five input numbers cannot be used in their original order, and their sum loses information because different sets can share a sum. Sorting the five numbers gives a unique representation of the set.

Use that sorted array as a map key and count how many students chose it. Then find the largest frequency. Finally add the frequencies of all keys attaining that maximum.

Keep the requested output in mind: it is a number of students, not a number of combinations or just the maximum frequency. If every combination is different, they all tie at frequency one, and every student wins.

## Walkthrough

Suppose combination A has three students, B has three, and C has one. The maximum frequency is three, but the answer is six. If two students list the same five course numbers in opposite orders, sorting merges them into one key with frequency two.

## Why it works

Sorting five distinct course numbers yields equal arrays exactly when the course sets are equal. The map therefore counts every combination correctly. Selecting all entries with the largest frequency picks exactly the winning combinations. Their student groups are disjoint, so summing their frequencies counts every winning student once.

## Complexity

Sorting five values is constant work. Ordered-map operations give O(N log N) total time and O(N) space in the worst case. Frequencies and the answer are at most 10,000.

## Common mistakes

- Treating different input orders as different combinations.
- Using a course sum as the key.
- Printing only the maximum frequency.
- Counting tied combinations without counting their students.
