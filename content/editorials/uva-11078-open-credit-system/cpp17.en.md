The first score initializes `highest`, because a legal pair does not exist until the second score is read. For every later `current`, the program updates `answer` with the old prefix maximum first, then incorporates `current` into `highest`. Those two statements must remain in that order to enforce `i < j`.

Because every case contains at least two students, the loop updates `answer` at least once and never prints `INT_MIN`. The implementation stores only the prefix maximum and the best difference, so it does not need an array even at the maximum input size.
