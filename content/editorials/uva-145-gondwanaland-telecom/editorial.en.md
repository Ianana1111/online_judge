# Count exact call minutes across daily tariff boundaries

## Problem and constraints

Telephone rates depend on plan A through E and on day `[08:00,18:00)`, evening `[18:00,22:00)`, or night. Calls last a positive whole-minute duration up to 24 hours and may cross midnight; equal start and end clock times mean a full day. Print the phone, three minute counts, plan, and exact charge in fixed-width columns. `#` ends input.

## Building the approach

Convert each clock to minutes since midnight. If finish is at or before start, add 1,440 to place it on the next day. Iterate the half-open interval `[start,finish)`, reduce each minute modulo 1,440, and increment its unique tariff bucket.

Store rates and totals in integer cents. Multiply each bucket count by the plan's corresponding rate, then format two decimal digits. Keep the phone number as a string to preserve leading zeroes and punctuation.

## Walkthrough

An A-plan call from 17:58 to 18:04 has two day minutes and four evening minutes, costing `2*10+4*6=44` cents. From 21:59 to 22:01, one minute is evening and one is night; the 22:01 endpoint itself is excluded.

## Why it works

After possible day extension, every integer in the half-open interval corresponds one-to-one with an actual call minute. Modulo returns its time of day, and the three ranges are disjoint and cover all minutes. Thus bucket counts are exact; fixed per-period rates make their integer weighted sum the exact charge.

## Complexity

For call durations `D_i`, time is `O(sum D_i)` with each at most 1,440, and extra space is `O(1)`.

## Common mistakes

- Treating equal clock times as zero duration.
- Including the finish minute.
- Charging 18:00 as day or 22:00 as evening.
- Accumulating money in floating point.
- Printing the explanatory column ruler or wrong widths.
