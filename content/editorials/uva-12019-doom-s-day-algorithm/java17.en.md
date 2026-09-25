Weekdays repeat every seven days. Store names Monday through Sunday, with Saturday at index 5. Compute `offset` as all days in months before the target plus `day-1`; subtracting one makes January 1 offset zero. The answer index is `(5+offset)%7`.

Fixed month lengths are clearer than system date parsing for one known year and avoid locale or timezone behavior.

Separate month-length and weekday arrays prevent confusing a day-of-year offset with a weekday index.
