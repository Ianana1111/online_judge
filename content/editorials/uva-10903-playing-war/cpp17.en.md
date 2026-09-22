The outer loop reads `n` first and only reads `k` for a nonzero case. Fresh win and loss arrays prevent state leakage, while the calculated game count consumes the complete schedule.

Equal move strings immediately continue. The `win` Boolean lists the three wins for the first player; the other non-draw branch updates the second player.

`fixed_ratio` scales the exact numerator before integer rounding and pads three fractional digits. The `first` flag inserts one blank line only between data sets, and player iteration preserves original numbering.
