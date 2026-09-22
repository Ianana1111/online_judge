Both `n` and `row` are `long long` before `2*row*row`, so multiplication uses wide arithmetic. `(n+1)/2` is exact for every legal odd row length.

`last` names the row's final value, directly reflecting the derivation, and output uses three times it minus six. The EOF loop prints one result per input without assuming a case count or sentinel and stores no generated rows.
