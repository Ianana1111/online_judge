The zero-initialized card skips cell `[2][2]`, leaving the internal free-square marker zero. The zero-initialized `called` array keeps time zero for that marker while all 75 real calls receive times one through 75.

For each index r, the nested loop computes both row r and column r maximums. The two diagonal accumulators persist across outer iterations and are included after all five positions are processed.

The program reads every call before calculating the result, so an early winning time never leaves unread data. The output uses the exact required sentence.
