Convert each hour-and-minute time into minutes since midnight. Subtract the current time from the alarm time. A positive difference means the alarm rings later today; a zero or negative difference means the next occurrence is tomorrow, so add 1440 minutes. The site specifies that equal times mean a full-day wait, not zero. Only four zeros together terminate input; a normal query can contain individual zero values.

The Python version splits whitespace-separated input and advances by each group’s actual field count.
