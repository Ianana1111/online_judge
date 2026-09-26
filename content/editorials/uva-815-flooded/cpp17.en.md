Sort elevations and imagine water rising from the lowest cells. With k cells at the current level, raising water to the next elevation requires (next−current)×k×100 cubic meters, because each cell covers 100 square meters.

If enough water remains, pay that volume and include the next cell. Otherwise distribute the remaining water over the k cells: the final level is current+remaining/(100k). Equal elevations cost zero and join naturally.

Submerged cells must be strictly below the final water level. Cells exactly at the surface do not count. Using k directly is wrong when there is no water or the volume exactly reaches the next elevation. Compare every elevation against the exact final fraction instead.

`format_ratio`/`fixed` rounds the final fractions to two decimal places, supports negative water levels, and avoids negative zero. Keep elevations and volume exact until formatting. For M cells, sorting takes O(M log M) time, the remaining work O(M), and storage O(M), excluding integer lengths.
