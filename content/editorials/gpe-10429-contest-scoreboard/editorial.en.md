# Delay penalties until the first accepted submission

## Problem and constraints

Build a scoreboard from submission records for teams 1 through 100 and problems 1 through 9. Include every team appearing in any record. On this platform the explicit ordering is **more solved problems, then less penalty, then smaller team number**, resolving the original statement's ambiguous penalty direction.

Only the first C for a problem counts: its submission time plus 20 minutes for every preceding I. Unsolved problems contribute no penalty. R, U, and E do not affect scores. Cases are separated by blank lines.

## Building the approach

Do not add 20 minutes to the total immediately when an I arrives. At that point we do not know whether the problem will ever be solved. Instead, separate tentative per-problem state from the team's finalized score.

For each team, keep a solved flag and wrong-attempt count for each problem, plus its total solved count and penalty. Process records in their input order. An I on an unsolved problem increments the tentative count. Its first C commits the time and accumulated penalty, increments the solved total, and freezes that problem. Later records for the same solved problem change nothing.

Create the team's entry before checking the verdict. A team with only an R record still participated and must appear with zero solved and zero penalty. Finally sort the resulting teams by the three required keys.

## Walkthrough

A team submits I at minute 10 and C at minute 21 for one problem. That problem contributes one solved and 41 penalty minutes. A later C or I changes neither value. If another problem receives only I, its penalty remains zero. Between teams with equal solved counts, penalty 10 ranks ahead of penalty 20; the team number breaks an exact tie.

## Why it works

Before the first C, the saved wrong count equals the number of preceding I records. The first C therefore adds exactly the required penalty once. The solved flag prevents double counting, and unaccepted problems never commit their tentative penalties. Creating an entry for every record includes precisely the participating teams. The final sort implements the platform's stated ranking order.

## Complexity

For S records and T participating teams, scoring takes O(S) time and sorting O(T log T). Score state uses O(9T) space. This implementation also stores the input and case records, taking space proportional to their text length.

## Common mistakes

- Adding penalties for problems never solved.
- Counting repeated C records or post-acceptance errors.
- Penalizing R, U, or E.
- Omitting teams that solved nothing.
- Sorting submissions before processing or sorting penalty in descending order.
