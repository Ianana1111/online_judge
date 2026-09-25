Enumerating four boundaries and summing every cell repeatedly is too expensive. Fix the top and bottom rows. For each column, accumulate all values between those rows into `columns[c]`. Choosing a consecutive range of columns now corresponds exactly to one rectangle with the fixed vertical boundaries.

Run Kadane's algorithm on `columns`. Let `ending` be the largest nonempty subarray sum ending at the current column. It either starts at the current value or extends the previous best ending:

`ending=max(columns[c], ending+columns[c])`.

For each top row, begin column sums at zero and extend the bottom row downward, adding one row at a time. This avoids recomputing band sums.

Initialize from real values rather than zero so an empty rectangle is never selected.

Fix top and bottom rows and compress each column to its band sum. Kadane then chooses the left and right boundaries. Initialize below all possible values so all-negative matrices work.
