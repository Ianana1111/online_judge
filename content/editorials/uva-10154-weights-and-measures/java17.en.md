Input is read line by line with `BufferedReader`, and `StringTokenizer` handles numbers separated by one or more spaces. All numbers are collected in an `ArrayList<Long>` and then paired into `{strength, weight}` arrays.

Sorting compares strength first and weight second with `Long.compare`, which avoids overflow from subtraction. A `PriorityQueue` with `Collections.reverseOrder()` becomes a max-heap, so `poll()` returns the heaviest weight currently chosen.

The main loop adds turtles by increasing strength and updates `total` (a `long`); whenever the total exceeds that turtle's strength, it subtracts the largest weight returned by `poll()`. Finally `stack.size()` is the answer.
