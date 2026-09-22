# Convert clock times to minutes and move forward around one day

## Problem and constraints

Given a current 24-hour time and an alarm time, output minutes until the next alarm occurrence. Crossing midnight may be required. Under this platform's explicit convention, equal nonterminal times mean the next day and therefore 1,440 minutes. Only four zeros terminate input.

## Building the approach

Convert both clocks to minutes after midnight: `start=60*h1+m1` and `finish=60*h2+m2`. If `finish>start`, their difference is the same-day wait. Otherwise add one full day to the difference. The strict comparison handles equal times with the local positive-wait convention.

Do not use absolute difference, which chooses an undirected distance rather than waiting forward in time. A zero in any individual field is a valid midnight-related value and does not terminate the case.

## Walkthrough

01:05 to 03:05 is 120 minutes. 23:59 to 00:34 initially differs by -1405; adding 1440 gives 35. 21:33 to 21:10 waits 1417 minutes until the following day. 12:00 to 12:00 waits 1440 under the platform rule.

## Why it works

When the target minute is later in the same day, subtraction is the exact forward duration. Otherwise the route consists of `1440-start` minutes to midnight plus `finish` minutes into tomorrow, totaling `finish-start+1440`. These cases cover every valid clock pair and return the required positive representative from 1 through 1440.

## Complexity

Each case takes `O(1)` time and space.

## Common mistakes

- Subtracting hours and minutes separately with faulty borrowing.
- Detecting rollover from hours alone.
- Taking C++ modulo of a negative difference.
- Using absolute difference.
- Treating any zero field as the sentinel.
- Returning zero for equal times despite the local next-day convention.
