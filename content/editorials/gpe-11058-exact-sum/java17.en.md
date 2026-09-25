Sort the prices and put pointers at the smallest and largest. If their sum is below M, keeping the current small price while decreasing the other price cannot help, so discard the left endpoint. If the sum is above M, keeping the large price while increasing the other cannot help, so discard the right endpoint.

When the sum equals M, save the pair and move both pointers inward. Do not stop at the first match. With a fixed total, a larger low price and smaller high price make the difference no larger, so later exact matches improve or tie the saved pair.

Require `left < right`, ensuring two different books. Sorting must retain duplicate entries; deduplicating prices would lose valid equal-price pairs.

Sort and search with two pointers; keep moving inward after a match so the last match has the smallest price gap.
