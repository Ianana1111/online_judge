Begin with all `C(MN,K)` cell sets. Define four bad events saying one border is empty and use inclusion-exclusion. A four-bit mask selects borders forced empty. If it removes `r` horizontal border rows and `c` vertical border columns, remaining cells number `(M-r)(N-c)`, and the intersection contributes `C(cells,K)`. Add even-popcount masks and subtract odd-popcount masks.

Precompute combinations through 400 with Pascal's recurrence modulo 1,000,007. This avoids assuming the modulus supports a factorial-inverse formula. Removing full rows and columns automatically handles corners without double subtraction.

Each bit marks a border forced empty. Remove its full row or column, then multiply remaining dimensions, which handles corners correctly. Build combinations with Pascal recurrence modulo 1,000,007.
