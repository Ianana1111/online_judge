The 36-entry cost array is indexed directly by digit value. Stream input ignores the statement's visual line wrapping and reads all costs continuously.

Each base copies `number` to x. The do-while adds `cost[0]` once for zero. Under the bounds, the maximum number of digits and symbol costs fit comfortably in `int`.

The lower-cost branch clears the list, and the following equality branch inserts that newly best base. Case separators are printed only before groups after the first, while each result list remains on one line.
