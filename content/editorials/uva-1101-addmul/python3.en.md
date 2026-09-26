Do not search operation strings directly. After k multiplications, every input x becomes m^k x + a t. The integer t collects additions weighted by their later multiplications. Checking only the input interval endpoints gives a feasible range [low, high] for t.

For a fixed t, place additions at the largest available weights first: m^k, m^(k−1), ..., 1. Quotients and remainders give the fewest additions, just like base-m digits. Having m additions at a lower weight can be replaced by one at the next weight, shortening the program.

We need not enumerate every t in the feasible interval. For any t greater than low, consider its first higher digit that differs from low. Rounding low up at that digit and setting all lower digits to zero cannot increase the digit sum. Thus it is enough to test low rounded upward to a multiple of each m^j, discarding values above high.

`append` merges adjacent equal operations. `less` compares run-length encoded strings without expanding long programs. Minimize length first, then use A < M for ties. When m=1, multiplication changes nothing and only k=0 is needed. For a maximum of K multiplications, time is O(K³) and space O(K); the input bounds keep K around 30 or less.
