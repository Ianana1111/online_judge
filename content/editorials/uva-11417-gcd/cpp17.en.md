The 501-entry table begins with zeros, correctly representing the no-pair cases. For each `right`, it first copies the previous prefix and then visits every strictly smaller `left`.

`std::gcd` receives positive integers, and contributions accumulate in `long long`. Since preprocessing is complete before input queries, repeated and decreasing values work unchanged. The terminating zero is never printed.
