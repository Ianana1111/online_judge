# Track the current coordinate of every original cell's data

## Problem and constraints

A spreadsheet of at most 50 rows by 50 columns undergoes cell exchanges and batch row or column insertions and deletions. Insertions occur before the listed labels, and all labels in one batch refer to positions before that operation. Queries ask where data originally in a given cell ended, or whether it was deleted. Newly inserted blank data is never queried.

## Building the approach

Store one current coordinate for each original cell's data. Initially it equals the original coordinate. For an exchange, any record at the first endpoint moves to the second and vice versa.

For a row deletion, data currently on a listed row becomes gone. Other data shifts upward by the number of deleted labels smaller than its row. For row insertion, it shifts downward by the number of labels less than or equal to its row, because inserting at the same label happens before it. Column operations use the identical rule on the other coordinate.

Within one batch, save the coordinate before updating and compare every label with that same value. Applying labels sequentially would incorrectly reinterpret later labels after earlier shifts. Deleted records remain gone under all later operations.

## Walkthrough

Data currently on row 4 receives insertions before rows 1 and 4, so both labels precede it and it moves to row 6. If rows 1 and 3 are deleted, data on row 4 survives but moves up two places to row 2. Data originally on current row 3 is destroyed rather than shifted to a lower row.

## Why it works

Induct on processed operations. Initial records have exact coordinates. Exchange updates precisely the records at its two endpoints. Insertion shifts a record by exactly the number of new rows or columns created before it. Deletion either removes a record whose coordinate is selected or shifts a survivor by exactly the selected coordinates before it. Because all comparisons use the pre-operation coordinate, each batch has simultaneous semantics. Thus every surviving record's stored coordinate remains exact, while deleted records correctly stay absent.

## Complexity

With at most `C = 2500` original cells, `O` operations, at most nine labels per batch, and `Q` queries, time is `O(9CO + Q)` and space is `O(C)`. No storage is needed for inserted blank cells or operation history.

## Common mistakes

- Applying batch labels sequentially and changing their coordinate basis.
- Using `<` rather than `<=` for insertion at the current position.
- Shifting data on a deleted row instead of marking it gone.
- Using two independent `if` statements and swapping a record twice.
- Indexing original records with a later, modified column count.
