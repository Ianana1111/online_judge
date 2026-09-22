The binary-search bounds cover every possible layer; 44,722 squared exceeds the maximum input. The predicate keeps the first side whose square reaches N.

`distance` is zero for an exact square. Its first branch fixes the right column, while the second fixes the top row, and both meet correctly around the turn. A single final swap handles odd layers. All squares, differences, and coordinates use `long long`; zero is rejected before calculation.
