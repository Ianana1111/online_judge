`uniqueDigits` shares one `used` mask across both values and executes exactly five iterations per value. Each digit bit is checked before insertion, and the final full mask explicitly confirms all ten digits.

`setfill('0')` with `setw(5)` pads only the next numeric field; later literals have no active width. `found` controls the no-solution message, while `first` inserts a blank line only between queries, never between solutions of one query.
