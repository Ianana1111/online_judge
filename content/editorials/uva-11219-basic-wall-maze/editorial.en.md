# Count completed birthday anniversaries with date comparisons

## Problem and constraints

Given a valid current date and birth date, report the completed integer age. A birth date in the future is `Invalid birth date`; an age greater than 130 is `Check birth date`; otherwise print the age. Equal dates give age zero. Dates are written as day, month, and year, and cases may be separated by blank lines.

## Building the approach

Store every date as the tuple `(year, month, day)`. Lexicographic tuple comparison then matches chronological order, so it first detects a future birth date.

For a nonfuture date, begin with `currentYear - birthYear`. This counts the possible birthday anniversaries. If the current `(month,day)` is earlier than the birth `(month,day)`, this year's anniversary has not occurred, so subtract one. Only after calculating the completed age should we test whether it is greater than 130.

No conversion to elapsed days is needed. For a February 29 birthday, February 28 of a nonleap year is still lexicographically before the birthday's month-day, while March 1 is after it, matching the problem's stated convention.

## Walkthrough

On 12 November 2007, a person born 1 January 1984 has already had the current year's birthday, so the age is 23. For a birth on 29 February 2004 and current date 28 February 2005, the year difference is one but the anniversary has not arrived, so the age is zero. If the raw year difference is 131 but the birthday is still ahead, the completed age is exactly 130 and remains valid.

## Why it works

For valid calendar dates, ordering `(year,month,day)` is exactly chronological ordering, so the first comparison correctly identifies every future birth date. Between the two year numbers there are `cy-by` candidate anniversaries. The current year's one has occurred exactly when the current month-day is not earlier than the birth month-day. Subtracting one in the opposite case therefore leaves precisely the number of completed anniversaries. Classifying that result with the strict `age > 130` condition matches the statement.

## Complexity

Every case performs a fixed number of integer comparisons and arithmetic operations, using `O(1)` time and `O(1)` extra space.

## Common mistakes

- Comparing the input `(day,month,year)` lexicographically in that order.
- Using only the difference between years.
- Rejecting age 130 by using `>= 130`.
- Dividing elapsed days by 365 and mishandling leap years or birthday boundaries.
- Printing a negative age before checking for a future birth date.
