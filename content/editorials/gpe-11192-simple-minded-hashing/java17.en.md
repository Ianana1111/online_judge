The ordering condition removes a choice rather than adding one. Once a set of letters has been selected, there is exactly one legal string: write those letters in increasing order. So the task is to count subsets of `{1,...,26}` containing `L` numbers with sum `S`.

Let `count[len][sum]` be the number of such subsets among letters processed so far. The empty subset gives `count[0][0]=1`. When processing value `v`, every old subset may skip it, while a subset that uses it comes from a previous state with one fewer element and sum `sum-v`.

Update `len` and `sum` downward. This ensures the source still describes the table before `v` was selected, so one letter cannot be used twice. The entire table is precomputed once; each query is then a lookup. Queries outside length 26 or sum 351 immediately return zero.

Strict increase gives each chosen subset exactly one ordering. Descending length and sum updates prevent choosing the same letter twice.
