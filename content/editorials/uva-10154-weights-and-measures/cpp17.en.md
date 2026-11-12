Each turtle is stored as `(strength, weight)`, with strength first in the pair, so the default `sort` orders by increasing strength and breaks ties by weight without a custom comparator. The loop `while (cin >> weight >> strength)` reads until end of file.

`priority_queue<long long>` is a max-heap by default and holds the weights of the turtles currently in the stack; `total` is their sum, stored in `long long` to avoid overflow. Each turtle is pushed and its weight added; if `total > turtle.first` (the total exceeds the strength of the new bottom turtle), the heaviest weight at the top of the heap is subtracted and popped.

A turtle heavier than its own strength overloads the stack as soon as it is added, and the heap top is at least as heavy as it, so one turtle is always removed and no invalid stack is counted. The final heap size is the maximum number of turtles.
