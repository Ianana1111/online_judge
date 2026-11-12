`collections.deque` provides O(1) `popleft` and `append`, matching "take from the top" and "put at the bottom". A plain list with `pop(0)` would shift every remaining element on each call, which becomes noticeably slow when n reaches ten thousand.

Each round pops one card with `popleft()` into the `thrown` list, then pops the next card and appends it back. The loop stops when one card remains.

The separator is produced by `", ".join(map(str, thrown))`. A space after the colon is added only when `thrown` is non-empty, so for n = 1 the first line is exactly `Discarded cards:` with no trailing space. All lines are collected and written once.
