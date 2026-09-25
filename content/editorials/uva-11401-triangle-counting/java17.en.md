Classify every triangle by its unique largest side `c`. For fixed second side `b`, the smallest side must satisfy both `c-b<a` and `a<b`, giving `max(0, 2b-c-1)` integer choices.

Summing this over `b` simplifies, according to the parity of `c`, to `floor((c-2)^2/4)`. Therefore

`triangles[n] = triangles[n-1] + floor((n-2)^2/4)`.

Precompute this prefix table through one million and answer each query by lookup. Promote before squaring so the multiplication itself occurs in 64 bits.

Compute increments and totals in `long` so products and answers do not overflow int.
