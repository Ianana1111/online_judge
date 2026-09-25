Store every date as the tuple `(year, month, day)`. Lexicographic tuple comparison then matches chronological order, so it first detects a future birth date.

For a nonfuture date, begin with `currentYear - birthYear`. This counts the possible birthday anniversaries. If the current `(month,day)` is earlier than the birth `(month,day)`, this year's anniversary has not occurred, so subtract one. Only after calculating the completed age should we test whether it is greater than 130.

No conversion to elapsed days is needed. For a February 29 birthday, February 28 of a nonleap year is still lexicographically before the birthday's month-day, while March 1 is after it, matching the problem's stated convention.

Compare complete dates to reject a future birth, then subtract one from the year difference only if this year’s birthday has not yet arrived. No conversion to elapsed days is needed.
