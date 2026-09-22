The complete `target` is read before `station` and `next` are initialized for that query. The push loop checks `station.empty()` before `station.back()`, and `next++` guarantees each coach enters once in arrival order.

A mismatch after all possible pushes sets `possible` false and ends only the simulation; no input is lost because the target is already stored. Only a successful top match is popped. `first = 0` ends the current target block, after which the program prints its required blank line and reads another `N`.
