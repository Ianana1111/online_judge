The loop condition `cin >> n && n != 0` handles both ways the input can end: it stops at end of file and it stops at the terminating 0, so the 0 is never printed. Reading `n` as `long long` is more than the one-million limit needs, but it rules out any overflow concern.

The answer is the derived formula `n <= 100 ? 91 : n - 10`. The boundary is "at most 100": 100 itself belongs to the branch that returns 91, and 101 returns 101 − 10 = 91, so the two pieces meet.

Each line is appended to the single string `out` with `to_string`, and the whole buffer is written with one `cout` at the end. Together with `ios::sync_with_stdio(false)`, 250,000 lines turn into one large write instead of a flush per line.
