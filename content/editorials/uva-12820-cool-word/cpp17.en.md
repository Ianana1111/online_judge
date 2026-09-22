Every word creates a fresh zeroed count array, empty set, and flags. Input is guaranteed lowercase, so `ch-'a'` directly selects the correct slot.

`set::insert(...).second` reports whether a frequency was new; once a duplicate is seen, `unique` remains false. `distinct` increases only for positive counts. The outer loop reads case sizes until EOF, resets the answer per case, and increments the printed case number once.
