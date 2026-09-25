Enumerating all segment pairs is quadratic. Instead, fix a small interval between consecutive endpoints and ask how many segment pairs cover it. The active segment set cannot change inside such an interval.

Create a `+1` event at every left endpoint and a `-1` event at every right endpoint, then sort all events. Suppose `k` segments cover the interval of length `L` from the previous event to the current event. Any two of them contribute that full length, so the interval contributes `L * C(k,2) = L*k*(k-1)/2`.

Add this contribution before applying the current event, because the old active count describes the interval just crossed. Events at the same coordinate have zero distance between them, so their internal ordering cannot change the total.

Turn endpoints into +1/−1 events; between events, overlap count is fixed and contributes choose(active,2) pairs per unit length.
