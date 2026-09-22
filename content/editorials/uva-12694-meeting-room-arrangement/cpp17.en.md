The vector stores original start and finish values, and the comparator orders only by finish. Since every interval has positive length, an accepted meeting moves `end` strictly forward.

The input loop stops before storing the `0 0` sentinel. Rejected meetings never alter state; accepted ones satisfy `start>=end`. With `end=0`, zero-start meetings remain eligible, and an empty vector naturally prints zero.
