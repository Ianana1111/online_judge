`board[col]` stores the row selected by the current backtracking branch. The three masks are passed by value, so returning from recursion automatically restores the previous state. Adding 7 to `row - 1 - col` shifts every descending-diagonal index into the safe range 0 through 14.

Both the input and generated boards use row numbers 1 through 8. The expression added to `cost` is a Boolean comparison, intentionally contributing only zero or one rather than a row distance. The 92 legal boards are generated once before any test cases are read.
