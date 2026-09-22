`forward` keeps the original ordered pair while `backward` inserts the reversed one immediately. Sorting `pair` values compares first coordinate and then second, keeping identical requests adjacent without removing copies.

Vector equality checks both lengths and every sorted element, so a single missing reverse student makes the result false. Location identifiers use `long long` rather than serving as array indices.

Fresh vectors are created for every case. The zero count is consumed only as the terminator and produces no verdict.
