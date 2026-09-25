Every query generates one sorted infinite stream. Keep exactly its next unreported event in a min-heap keyed by `(time,id)` and store period alongside it. Initially push `(period,id,period)` for every query.

Repeatedly pop the smallest event, print its ID, advance its time by its own period, and push it back. Sorting only by original periods once is insufficient because next occurrence times evolve; scanning every second wastes empty time.

Keep only the next occurrence of each query in a min-heap; break equal-time ties by smaller identifier.
