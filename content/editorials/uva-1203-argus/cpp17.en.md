An event tuple is `(next time, ID, period)`. `greater` makes the priority queue a lexicographic minimum heap, and the first two fields fully determine event order because IDs are unique.

The parser reads the command token before ID and period and stops at `#`, then reads `K`. Every iteration pops, prints, and reinserts `(time+period,id,period)`, so the heap always retains one representative per registration. Time uses 64 bits.
