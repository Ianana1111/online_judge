The row heights for one wave are `1,2,...,A-1,A,A-1,...,2,1`. Print the rising loop from 1 through `A`, then the falling loop from `A-1` through 1 so the peak appears once. At height `h`, construct a string of length `h` filled with digit `h`.

Use one `firstWave` flag for the entire output, rather than resetting it per test case. Before every wave except the first, print one blank separator line. Prefixing separators this way avoids needing to remove a trailing blank line later. When `A = 1`, the falling loop is empty and the wave contains one row.

Rise to the amplitude and fall from amplitude−1; place one blank line only between waves.
