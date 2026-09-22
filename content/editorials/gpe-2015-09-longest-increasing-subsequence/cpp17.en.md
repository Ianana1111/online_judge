`lower_bound` returns the first tail at least `x`. All earlier tails are strictly smaller, so `x` extends the longest of them. Reaching `end()` creates a new attainable length; otherwise replacement lowers the best tail at the same length.

Replacing a tail does not erase the existence of an earlier subsequence. Any future value that could follow the old larger tail can also follow the new smaller one. A fresh `tails` vector is created inside the input loop, and values are processed as they are read. Only `tails.size()` is printed because the problem does not request path reconstruction.
