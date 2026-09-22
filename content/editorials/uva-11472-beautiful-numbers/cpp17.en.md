`dp` represents one current length and `next` is freshly zeroed, so each transition appends exactly one digit. `full=(1<<base)-1` has every relevant bit set. Counts ending in different digits are summed, then accumulated into the answer for at-most length.

Initialization begins at digit 1, while later transitions may legally reach zero. Each modular addition combines values below `MOD` and fits signed 32-bit range. Swapping rolling layers limits memory, and queries read only the precomputed table.
