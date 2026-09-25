Sort the data. Let `low=values[(N-1)/2]` be the lower median and `high=values[N/2]` the upper median. Every integer in the closed interval `[low,high]` minimizes total absolute deviation, and no value outside it does.

The first output is therefore `low`. The number of distinct integer choices is `high-low+1`. To count input occurrences that are optimal, count all sorted elements within the complete interval using `upper_bound(high)-lower_bound(low)`.

For odd N the two medians coincide. For even N both endpoints and all integers between them are optimal, so duplicates at both ends contribute to the second field.

Up to one million Python integers would exceed this site's memory limit. A fixed-width frequency array stores only the 65,536 possible values, while input is parsed in chunks. Cumulative counts locate both median ranks; the second field still counts duplicate input occurrences inside that interval.
