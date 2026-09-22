The table is allocated only through `target`, because positive lengths cannot return from an overshoot. Each length is read as a wide integer; `continue` skips only its transition, not input consumption.

The signed descending loop stops normally below the bar length. The old destination represents exclusion, while `possible[sum-length]` represents inclusion. Output occurs only after every bar in the case has been read.
