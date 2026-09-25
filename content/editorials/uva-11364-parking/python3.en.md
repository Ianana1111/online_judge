Every required store lies between the leftmost position L and the rightmost position R. Visiting all stores and returning to the car must cover that interval in both directions. Parking at L, walking to R, and returning attains the minimum `2 * (R - L)`. Only the minimum and maximum positions matter; sorting and visit order do not. One store or repeated equal positions correctly gives zero. Read the number of test cases, then consume exactly the stated number of positions in each case.

The Python version splits whitespace-separated input and advances by each group’s actual field count.
