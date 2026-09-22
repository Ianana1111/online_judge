`compare` orders endpoint expressions of the form `constant + sign*sqrt(square)`. It separates sign cases before squaring, since squaring two values of different signs would reverse or destroy the original ordering information. `one_root` reduces comparisons with one radical to integer sign and squared-magnitude checks. Python integers keep the intermediate products exact.

`solve` scales coordinates, rejects sprinklers with no positive horizontal span, and sorts interval left endpoints with the exact comparator. The index `at` moves only forward through intervals whose left endpoint can connect to the current prefix. `farthest` retains the best right endpoint among them; discarded eligible intervals can never later extend beyond that selected endpoint.

Before updating `covered`, the code requires strict forward progress. This detects an unavoidable gap and also prevents a zero-progress loop. A zero-length target returns zero before interval processing.
