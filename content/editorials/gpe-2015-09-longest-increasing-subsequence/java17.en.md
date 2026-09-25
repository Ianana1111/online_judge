Among two increasing subsequences of equal length, keeping the one with the smaller ending value is always at least as useful for future extensions. This lets us summarize every attainable length by one best tail.

Maintain `tails[k]` as the smallest known ending value of a strict increasing subsequence of length `k+1`. For a new value `x`, find the first tail greater than or equal to it using `lower_bound`. If none exists, `x` extends the longest length. Otherwise replace that tail with `x`, improving or preserving the extension opportunity for that length.

The tails remain increasing, so binary search is valid. Their entries need not belong to one common subsequence; only the number of attainable lengths is the answer.

`tails[k]` holds the smallest ending value of an increasing subsequence of length k+1; replace the first tail not less than each new value.
