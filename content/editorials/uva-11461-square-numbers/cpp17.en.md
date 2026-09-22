The square list begins with root 1 because valid queries are positive. The loop condition retains every square through the upper limit, and increasing roots keep the vector sorted.

`first` is the first included iterator and `after` is the first excluded iterator, so subtraction directly returns zero for an empty interval as well. The input loop stops only when both values are zero; all other pairs satisfy the stated ordering.
