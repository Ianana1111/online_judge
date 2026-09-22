The six array indices always mean top, bottom, north, south, west, and east; they do not represent face numbers. A fresh `{1,6,2,5,3,4}` array is created for every nonzero command count.

`auto old = face` snapshots the orientation. Every rotation branch reads only `old` and replaces all six positions at once. For example, the north branch assigns the old south to the new top, old north to bottom, old top to north, and old bottom to south, while preserving west and east.

The input guarantees a valid direction, so the final branch after north, south, and west represents east. Only `face[0]` is printed after all commands.
