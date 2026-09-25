Convert each hour-and-minute time into minutes since midnight. Subtract the current time from the alarm time. A positive difference means the alarm rings later today; a zero or negative difference means the next occurrence is tomorrow, so add 1440 minutes. The site specifies that equal times mean a full-day wait, not zero. Only four zeros together terminate input; a normal query can contain individual zero values.

The Java version reads tokens with `Scanner`, uses an integer type wide enough for the bounds, and obeys the specified terminator.
