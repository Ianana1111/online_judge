The month layouts look different, but both calendars describe the number of days elapsed from the same epoch. That absolute, zero-based day number is the simplest bridge between them.

If `monthIndex` is the zero-based position of the Haab month, then

`elapsed = year * 365 + monthIndex * 20 + day`.

The formula also works for `uayet`: although that month has only five valid days, it begins after exactly eighteen complete 20-day months.

On elapsed day `d`, the Tzolkin number is `d % 13 + 1`, its name is `names[d % 20]`, and its year is `d / 260`. The number and name advance on every day independently; one does not wait for the other to complete a cycle.

Convert the Haab date into elapsed days from the common origin, then use remainders modulo 13 and 20 for the Tzolkin number and name, and divide by 260 for the year.
