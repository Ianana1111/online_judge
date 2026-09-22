# Raise the sorted lowest prefix one terrain level at a time

## Problem and constraints

An `M x N` region, with each cell 10 meters by 10 meters, has integer elevations that may be negative. A nonnegative water volume spreads globally to the lowest terrain under the stated drainage model. Find final water level and the percentage of cells strictly below that level, both to two decimals. Cells merely touching the surface are not submerged.

## Building the approach

Sort all elevations. Suppose the lowest `count` cells currently share water level `level`. Raising them to the next elevation `h` needs `(h-level)*count*100` cubic meters because each cell has area 100. If enough water remains, spend that volume and add the next cell to the active prefix; otherwise divide the remaining water uniformly among those `count` cells and stop.

Represent the final water level exactly as a rational numerator and denominator. Re-scan all elevations and test `height*denominator < numerator`. Do not infer the submerged count from the active prefix: when remaining water is exactly zero, cells equal to the level are only touching. With zero water, the level is the minimum elevation and submerged percentage is zero.

## Walkthrough

For elevations 0 and 10 with 1000 cubic meters, the first 100-square-meter cell rises exactly to 10. Only elevation 0 is strictly below the final level, so percentage is 50.00. Two cells at -10 with zero water give level -10.00 and 0.00 percent submerged.

## Why it works

At equilibrium, water covers a lowest sorted prefix; a higher cell cannot join before all lower active cells reach its elevation. Each layer-volume computation is exactly area times height increase, preserving volume conservation. The first unaffordable next level cannot be reached, so uniformly distributing the remainder over the active area gives the unique final level. Exact cross multiplication applies the strict submersion definition before any display rounding, yielding the correct percentage.

## Complexity

For `K = MN <= 841`, sorting costs `O(K log K)` and filling plus counting `O(K)`, with `O(K)` storage.

## Common mistakes

- Forgetting each cell's 100-square-meter area.
- Counting terrain equal to the water level as submerged.
- Rounding the level before deciding submerged cells.
- Mishandling zero water and marking minimum cells submerged.
- Simulating local basins despite the global drainage assumption.
