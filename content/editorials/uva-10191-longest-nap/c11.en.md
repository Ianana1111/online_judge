Convert each time to minutes after midnight and sort `(start,end)` pairs. Maintain `cursor`, the rightmost end of the union of all processed busy intervals, beginning at 600 for 10:00.

Before each sorted appointment, `start-cursor` is a free gap when positive. Update the best only when this gap is strictly longer; scanning is chronological, so strict comparison preserves the earliest among ties. Then set `cursor=max(cursor,end)` so an appointment nested inside a longer one cannot move the busy boundary backward.

Append an internal sentinel appointment `(1080,1080)` to test the final gap through 18:00 with the same logic.

Sort appointments by start and keep the farthest end of the busy union. The gap before the next appointment is a nap candidate; update only on a strictly longer gap to retain the earliest tie.
