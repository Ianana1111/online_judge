All queries are read first so the factorial table stops at the required maximum half size. `factorial[0]=1` makes `n=1` work naturally, and every multiplication uses `long long` before immediate reduction.

For each query, `f` is factorial of floor half, and `f*f` handles even size. Odd size multiplies once more by `n`, combining all three middle-value regions. Input has neither a case count nor sentinel, so EOF controls reading and buffered order controls output.
