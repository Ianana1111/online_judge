# Convert both calendars through an absolute day number

## Problem and constraints

A Haab year has eighteen 20-day months followed by the five-day month `uayet`, for 365 days in total. Both its day and year are zero-based. The Tzolkin calendar advances a number from 1 through 13 and a name through a list of 20 names; both cycles return together after 260 days. Given Haab years below 5000, convert every date and print the number of dates first.

## Building the approach

The month layouts look different, but both calendars describe the number of days elapsed from the same epoch. That absolute, zero-based day number is the simplest bridge between them.

If `monthIndex` is the zero-based position of the Haab month, then

`elapsed = year * 365 + monthIndex * 20 + day`.

The formula also works for `uayet`: although that month has only five valid days, it begins after exactly eighteen complete 20-day months.

On elapsed day `d`, the Tzolkin number is `d % 13 + 1`, its name is `names[d % 20]`, and its year is `d / 260`. The number and name advance on every day independently; one does not wait for the other to complete a cycle.

## Walkthrough

`0. pop 0` gives `elapsed = 0`, so it becomes `1 imix 0`. At `elapsed = 13`, the number has wrapped to one while the name is at index 13, producing `1 ix 0`. At `elapsed = 260`, both cycles return to their first values and the ceremonial year becomes one: `1 imix 1`.

## Why it works

All complete Haab years contribute `365 * year` days, all complete months contribute `20 * monthIndex`, and `day` counts the days already passed in the current month. Thus `elapsed` is exact. Modulo 13 and modulo 20 select the current positions in the two Tzolkin cycles, while integer division by 260 counts complete cycles. These are precisely the three required output fields.

## Complexity

Both name tables have constant size, so each conversion uses `O(1)` time and `O(1)` extra space. The maximum elapsed day fits comfortably in an `int`.

## Common mistakes

- Treating the Haab day as one-based.
- Giving `uayet` twenty valid days or shifting its starting offset.
- Forgetting that the Tzolkin number needs `+1`.
- Dividing by 365 for the Tzolkin year.
- Failing to consume the period after the day or to print the initial case count.
