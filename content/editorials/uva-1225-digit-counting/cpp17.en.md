`array<int,10> count{}` value-initializes every counter to zero for each test case. `value` remains the outer-loop integer, while `x` is a disposable copy used for digit extraction.

The `x>0` loop is correct because every enumerated value is positive. A remainder of zero is still counted normally. The output loop indexes counters from zero through nine, inserts spaces only before later fields, and never materializes the complete written sequence, so memory use stays constant.
