The loop calls `getline` twice per iteration, making two physical lines one test case. Empty lines are preserved rather than skipped.

Both fixed-size count arrays are value-initialized to zero for every case. Counting only characters from `a` through `z` also harmlessly ignores a possible carriage return from a Windows line ending; valid problem data otherwise consists solely of lowercase letters.

The output loop visits indices zero through 25. `string(count, character)` produces exactly the minimum shared multiplicity, including an empty string when the count is zero. The final newline is unconditional, so a case with no common letters still emits its required empty answer line.
