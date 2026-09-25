Keep one next event per medicine in a minimum heap keyed by `(time,inputIndex)`. Repeatedly pop and print the minimum, then reschedule that same medicine at `time+period` and push it back. Perform exactly K iterations.

Tuple order compares time first and original index second, implementing the tie rule. Later events of one medicine need not be generated before its current earliest event is consumed.

Order a min-heap by next time and original input order; after printing, add the period and reinsert.
