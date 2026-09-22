`factorial` uses `long long` through 20 and `count` stores remaining lowercase frequencies. `rank` remains zero-based relative to the current prefix throughout.

For a candidate, its frequency is decremented before computing `(remaining-1)!` divided by every remaining frequency factorial. If `rank < ways`, the character is appended and that decrement remains; otherwise the block size is subtracted and frequency restored. Valid input guarantees one candidate is selected at every position.
