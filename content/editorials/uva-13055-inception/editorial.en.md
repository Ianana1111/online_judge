# Model nested dreams with a last-in, first-out stack

## Problem and constraints

Process up to 10,000 commands. `Sleep X` enters X's dream inside the current dream, `Kick` exits only the innermost dream or does nothing when awake, and `Test` prints the current dream owner or `Not in a dream`. Names preserve case and duplicate names still represent distinct layers.

## Building the approach

Nested entry and exit are last-in, first-out, so store the path from outermost to innermost in a stack. `Sleep` pushes a name, `Kick` pops one entry only when nonempty, and `Test` reads the top or prints the awake phrase.

Keeping only the latest name would lose the previous layer after a kick. A queue would remove the outermost dream rather than the current innermost one.

## Walkthrough

After `Sleep Alice`, `Sleep Bob`, `Test` prints Bob. A kick followed by a test prints Alice; another kick and test prints `Not in a dream`. An additional kick has no effect. Sleeping Alice twice and kicking once still leaves the outer Alice layer.

## Why it works

Maintain the invariant that the stack lists every active dream from outermost to innermost. It begins empty. Push appends exactly the new inner layer, while a guarded pop removes exactly that layer and exposes its parent. Therefore the invariant survives every command, and top-or-empty inspection gives the exact current state.

## Complexity

Each stack operation is amortized `O(1)` apart from copying a name of length at most 15. With `Q` active layers, storage is `O(Q)` names.

## Common mistakes

- Popping or reading an empty stack.
- Clearing every dream on one kick.
- Reporting the outermost rather than innermost layer.
- Deduplicating equal names.
- Printing output for commands other than `Test`.
