The row map associates each integer height with an `n`-character blank canvas. For F, height changes before the write; for R, after the write; C does not change it.

The ordered map exposes lowest and highest occupied heights. Output iterates downward across that range and removes only rightmost spaces, preserving meaningful leading and internal positions. Missing intermediate rows are rendered blank after the axis.

Every row begins with `| `, and the axis uses `n+2` dashes. Two final newline characters provide the required blank line between cases.
