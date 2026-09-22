The zero-initialized `ways` array accumulates the recurrence, with `ways[0] = 1` as its starting point. The outer `pairs` loop increases the total size, so both entries used by the inner loop have already been computed.

`inside` counts pairs on one side of the first handshake. The other side contains `pairs - 1 - inside`; subtracting one reserves the handshake we fixed. Every possible even-sized split appears exactly once as `inside` ranges from zero to `pairs - 1`.

The input loop has no numeric sentinel. The `first` flag inserts one blank line before each answer after the first, without confusing blank input lines with separate parsing rules. All queries reuse the same precomputed table.
