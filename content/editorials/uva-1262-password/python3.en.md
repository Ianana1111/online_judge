For each column, form the set intersection of letters from both grids and list it from A through Z. Valid passwords are exactly the Cartesian product of these five sorted lists, with at most `6^5=7776` elements.

Let `suffix[col]` be the number of combinations from that column onward. Convert `K` to zero-based `rank`. At column `col`, every candidate letter owns a consecutive block of `suffix[col+1]` passwords. Choose index `rank/block`, then replace `rank` by `rank%block`. Reject before division when the total is too small.

For each column, intersect the letters present in both grids and sort distinct options. The five option sets form a Cartesian product; use suffix product sizes to decode the K-th lexicographic password column by column.
