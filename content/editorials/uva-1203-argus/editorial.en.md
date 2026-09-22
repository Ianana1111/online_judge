# Merge periodic event streams with a minimum heap

## Problem and constraints

Each registered query has a distinct ID and period. Its events occur at `period, 2*period, ...`. Print IDs for the earliest `K` events, ordering simultaneous events by smaller ID. Up to 1,000 queries and 10,000 outputs occur; `#` ends registration.

## Building the approach

Every query generates one sorted infinite stream. Keep exactly its next unreported event in a min-heap keyed by `(time,id)` and store period alongside it. Initially push `(period,id,period)` for every query.

Repeatedly pop the smallest event, print its ID, advance its time by its own period, and push it back. Sorting only by original periods once is insufficient because next occurrence times evolve; scanning every second wastes empty time.

## Walkthrough

Queries 2004 every 200 seconds and 2005 every 300 produce events at 200/2004, 300/2005, 400/2004, and both at 600 where ID 2004 comes first. The first five IDs are 2004, 2005, 2004, 2004, 2005.

## Why it works

Initially each heap entry is its query's earliest event. Assume this remains true. Any later event of a query cannot precede its heap representative, so the globally next event must be the heap minimum by time then ID. After outputting it, only that query's representative changes to its next period; reinsertion restores the invariant. Induction yields the exact first `K` global events.

## Complexity

With `R` registrations, heap construction as written is `O(R log R)` and `K` pop-push pairs cost `O(K log R)`. Space is `O(R)`.

## Common mistakes

- Using the default maximum heap.
- Breaking simultaneous ties by registration order rather than ID.
- Advancing by the wrong period or resetting to the initial time.
- Reordering repeatedly by original period instead of next time.
- Scheduling first events at time zero.
