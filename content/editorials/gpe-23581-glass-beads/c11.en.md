Constructing and comparing all rotations costs quadratic time and storage. Maintain two candidate starts `i` and `j`, and let `k` be the length of their equal compared prefix. Compare characters at `(i+k)%n` and `(j+k)%n`.

When they match, increase `k`. At the first mismatch, the side with the larger character is worse. More strongly, every candidate from that start through start plus `k` can be eliminated, so advance the losing pointer by `k+1` and reset `k` to zero. If both pointers meet, advance the one just moved again to keep candidates distinct.

If a pointer leaves the original start range, the other survives. If `k` reaches `n`, both rotations are identical and the smaller index satisfies the tie rule.

Booth’s algorithm compares two rotation candidates. At their first differing character, the larger side and the next k candidates cannot be minimal, so skip k+1 starts at once and return the smaller surviving index.
