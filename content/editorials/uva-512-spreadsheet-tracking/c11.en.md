Queries ask where an original cell's data went, not what is currently stored at a coordinate. Track each original cell's current position instead of physically rebuilding the entire spreadsheet after insertions.

EX swaps contents at current positions: data at a moves to b, and data at b moves to a. Use else-if so a just-moved item is not immediately moved back. Other positions stay unchanged, and deleted data cannot return.

A deletion batch is simultaneous. Take the cell's pre-operation coordinate before: if it equals a deleted index, mark it permanently GONE; otherwise subtract the number of deleted indices below it. Insertions happen before marked indices, so count index≤before and add that many positions.

Always compare every batch index with the same before value. Updating after each index would misinterpret later labels, especially when their input order differs. Rows and columns use the same rule on their respective coordinate.

Map an original query (r,c) through position[(r−1)·columns+c−1] using the original column count: these IDs never change meaning. Initially there are at most 2500 cells and at most nine indices per batch. Time is O(operations×original cells×batch size), each query is O(1), and storage is O(original cells).
