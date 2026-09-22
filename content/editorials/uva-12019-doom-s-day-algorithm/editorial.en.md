# Convert a 2011 date into an offset from January first

## Problem and constraints

For a valid date in fixed year 2011, print the full English weekday name. The year is not leap, February has 28 days, and no timezone or other year needs consideration. January 1, 2011 was Saturday.

## Building the approach

Weekdays repeat every seven days. Store names Monday through Sunday, with Saturday at index 5. Compute `offset` as all days in months before the target plus `day-1`; subtracting one makes January 1 offset zero. The answer index is `(5+offset)%7`.

Fixed month lengths are clearer than system date parsing for one known year and avoid locale or timezone behavior.

## Walkthrough

January 1 has offset 0 and is Saturday. January 3 has offset 2 and maps to Monday. February 1 is 31 days later and maps to Tuesday. March 1 includes 31 January days and 28 February days; adding a leap day would shift every later answer.

## Why it works

Summing completed preceding months and completed days within the current month gives exactly the elapsed-day difference from January 1. Every elapsed day advances weekday by one, and modulo seven represents its cycle. Applying this exact offset to the correct base weekday yields every date's weekday.

## Complexity

At most eleven month lengths are added per case, so time and space are `O(1)`.

## Common mistakes

- Adding `day` instead of `day-1`.
- Treating 2011 as a leap year.
- Confusing one-based month input with zero-based arrays.
- Using a Sunday-first weekday array with the same base index.
- Using the execution year's calendar rather than fixed 2011.
