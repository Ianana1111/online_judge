Maintain one instance of each candidate and a Boolean feasibility flag. Insert every value into all three. On extraction, for each candidate check that it is nonempty and its next value equals the record; otherwise permanently clear its flag. Pop safely from nonempty containers so later operations can still be consumed.

After replay, count true flags. Zero gives `impossible`, one gives the exact structure name, and more than one gives `not sure`. Duplicates must remain as separate entries, especially in the heap.

Replay every operation against a stack, queue, and max-priority queue. A candidate is permanently eliminated at its first extraction mismatch; classify by the remaining count.
