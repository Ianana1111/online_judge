The whole input becomes a list of integers. `values[0::2]` are the weights and `values[1::2]` the strengths, and `zip(values[1::2], values[0::2])` builds `(strength, weight)` pairs whose sorted order is increasing strength.

Python's `heapq` is a min-heap only, so the program stores negated weights: the smallest negative value at the top corresponds to the heaviest turtle. Each turtle is added with `heappush(stack, -weight)` and its weight added to `total`; if the total exceeds the strength, `heappop` returns the negated largest weight, so `total += heappop(stack)` subtracts that weight.

At the end, `len(stack)` is the maximum number of turtles. Python integers cannot overflow.
