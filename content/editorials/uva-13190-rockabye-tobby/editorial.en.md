# Merge periodic medicine schedules with one next event per medicine

## Problem and constraints

Each medicine is taken at positive multiples of its fixed frequency, starting at the frequency itself. Print the first `K<=10000` events among up to 3,000 medicines. Events at the same time follow input order, regardless of medicine name.

## Building the approach

Keep one next event per medicine in a minimum heap keyed by `(time,inputIndex)`. Repeatedly pop and print the minimum, then reschedule that same medicine at `time+period` and push it back. Perform exactly K iterations.

Tuple order compares time first and original index second, implementing the tie rule. Later events of one medicine need not be generated before its current earliest event is consumed.

## Walkthrough

Medicine Z with period 2 listed before A with period 3 produces `2 Z,3 A,4 Z,6 Z,6 A`. At time six, Z wins because of input priority even though A is lexicographically earlier.

## Why it works

Initially the heap contains each medicine's first event. If it contains each schedule's earliest unprinted event, then the global earliest unprinted event must be among those heap entries because every later event in the same schedule has a greater time. Popping it is correct; advancing that one schedule restores the invariant. Induction yields the first K events, with the index key resolving every tie correctly.

## Complexity

Heap construction costs `O(N log N)` as written, K events cost `O(K log N)`, and storage is `O(N)`.

## Common mistakes

- Breaking ties by medicine name.
- Resetting a popped medicine to its first period.
- Rescheduling relative to the global current time.
- Treating time zero as the first dose.
