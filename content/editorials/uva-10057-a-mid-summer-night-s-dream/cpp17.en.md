Indices `(n-1)/2` and `n/2` coincide for odd input and select adjacent central elements for even input, eliminating a special branch. `lower_bound` locates the first value at least `low`, while `upper_bound` locates the first value greater than `high`; their iterator difference includes all duplicated endpoints.

The second field is this occurrence count, while only the third uses `high-low+1`. The code never calculates the potentially large objective sum because the proven median interval is sufficient. Each EOF-delimited dataset is read and sorted independently.
