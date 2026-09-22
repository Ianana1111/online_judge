While reading each cumulative list, `previous` tracks the preceding entry. The row expression subtracts both that previous sum and the number of columns; the column expression subtracts the number of rows. These are already the demands after placing one in every cell.

`edge[i][j]` saves the forward edge index for that cell. Dinic's reverse edges permit moving flow between alternative row-column assignments while preserving totals. All capacities are integers, so every augmentation and final cell value stays integral.

After maximum flow, `initial - capacity` is the extra amount assigned to a cell. Printing `1 + initial - capacity` restores its baseline. The code relies on the statement's feasibility guarantee rather than inventing an output for impossible data. Each reconstructed row prints exactly C entries, with a blank line between matrix cases.
