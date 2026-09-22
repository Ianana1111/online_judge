Before the loop, `previous` is the zero-step count and `current` is the one-step count. Each iteration computes `next` before overwriting either predecessor, then shifts both states forward.

All three variables use `unsigned __int128`, so addition occurs at the wider precision rather than overflowing first. `decimal` repeatedly extracts the last base-ten digit, appends it, divides by ten, and reverses the collected characters. It also handles zero defensively, although no legal answer is zero.
