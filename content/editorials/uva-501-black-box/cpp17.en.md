`inserted` is the number of prefix values already loaded, so each query's `while` adds exactly up to `queries[rank]`. Before a GET, `lower.size()` equals the number of earlier GETs. Inserting a small value through `lower` and immediately transferring its maximum keeps that size unchanged.

`upper` uses `greater<long long>` to expose its minimum, while `lower` is the default max-heap. The GET transfer grows the claimed rank by one and printing `lower.top()` returns its boundary. Heaps retain duplicate entries. A blank line is emitted between datasets, with one answer per line.
