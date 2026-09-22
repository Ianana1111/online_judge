Every recursive choice pushes a divisor, calls search, and pops it, restoring the shared path for the next candidate. Recording the final remainder also uses push/copy/pop, so stored answer vectors are independent of later backtracking.

Passing the current divisor as the next `minimum` permits repeated factors such as `2 2 5` while forbidding a smaller later factor. `!path.empty()` is the condition that excludes the trivial one-factor expression.

`std::sort` on `vector<int>` performs elementwise numeric lexicographic comparison, exactly matching the required line order before formatting with single spaces.
