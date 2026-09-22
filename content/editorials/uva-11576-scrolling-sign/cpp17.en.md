`answer` starts at the full first-word length. Each overlap search begins at `length`, and `compare` matches the ending range of `previous` with the starting range of `next`.

Reaching zero naturally represents no shared characters. After adding `length-overlap`, assigning `previous=next` restores the exact display state. A single-word case skips the transition loop, while identical words match immediately.
