Binary Huffman coding repeatedly combines the two least frequent symbols. Here each merge combines R symbols. Putting rare symbols deeper and frequent ones shallower minimizes the frequency-weighted total code length.

An R-ary tree cannot use every possible leaf count directly. Each merge decreases the queue size by R−1. Add zero-frequency dummy letters until there are at least R leaves and (leaves−1) is divisible by R−1. They do not change the cost and must not be printed.

Remove R nodes ordered by frequency, breaking ties by their earliest contained letter. Their removal order assigns child digits 0 through R−1. A merged node stores the sum of frequencies and the earliest letter among its children. Traverse from the root and append child digits to obtain each real letter's code.

The queue maintains unmerged nodes and `visit` generates codes. Round the average length to two decimal places with integer arithmetic. For L padded leaves, the priority-queue versions take O(L log L + output length) time and O(L + output length) space. The C version scans for a minimum because there are at most 26 real letters, taking O(L² + output length) time.
