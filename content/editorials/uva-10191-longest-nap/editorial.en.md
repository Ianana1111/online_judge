# Merge busy intervals and keep the earliest longest gap

## Problem and constraints

Each day contains 1 through 100 appointments within the working interval 10:00 to 18:00. Appointments may be unsorted or overlap, and their descriptions may contain spaces. Find the longest free nap interval; ties use the earliest start. At least one positive gap is guaranteed. Output uses the required day number, start time, and duration wording.

## Building the approach

Convert each time to minutes after midnight and sort `(start,end)` pairs. Maintain `cursor`, the rightmost end of the union of all processed busy intervals, beginning at 600 for 10:00.

Before each sorted appointment, `start-cursor` is a free gap when positive. Update the best only when this gap is strictly longer; scanning is chronological, so strict comparison preserves the earliest among ties. Then set `cursor=max(cursor,end)` so an appointment nested inside a longer one cannot move the busy boundary backward.

Append an internal sentinel appointment `(1080,1080)` to test the final gap through 18:00 with the same logic.

## Walkthrough

Appointments 10:00-15:00 and 11:40-13:20 overlap. Processing the nested second interval must leave cursor at 15:00. If the next appointment starts at 16:00, the real gap is 15:00-16:00.

A sixty-minute nap prints `1 hours and 0 minutes`. If several gaps have equal maximum length, only the first encountered start is retained.

## Why it works

After each sorted appointment, cursor equals the furthest endpoint of the processed interval union. If the next start is no later than cursor, it overlaps that union and creates no gap. If later, no processed appointment reaches the interval and no future appointment starts earlier, so `[cursor,start)` is exactly one complete free interval.

Updating cursor with max preserves the invariant. The initial boundary and final sentinel cover both ends of the workday. Every gap is checked in chronological order, and strict replacement yields the earliest maximum.

## Complexity

Sorting takes `O(S log S)` time, scanning `O(S)`, and appointment storage `O(S)`.

## Common mistakes

- Assuming appointments are pre-sorted.
- Assigning cursor directly to a nested appointment's end.
- Using `>=` and replacing an earlier tied nap.
- Missing the opening or closing workday gap.
- Tokenizing the description and misaligning subsequent input lines.
