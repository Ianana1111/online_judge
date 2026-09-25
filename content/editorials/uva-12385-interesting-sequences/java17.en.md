Scan from the endpoint of the last chosen interval while recording values seen in the current search. The first repeated value creates the earliest possible finishing interesting interval, so choose it immediately. Clear the current seen set, but insert the current value again because this right endpoint may also start the next interval.

To avoid repeatedly clearing a 100,001-entry array, use epochs. `seen[v]==epoch` means `v` belongs to the current search. Choosing an interval increments the epoch, invalidating all old marks in constant time, and the current value is then marked in the new epoch.

Allocate `seen` for each new case; distinguish splits within a case by epoch number.
