# Intern nested sets into canonical integer identities

## Problem and constraints

The machine stores sets on a stack, and a set may itself contain sets. `PUSH` adds the empty set, `DUP` copies the top identity, `UNION` and `INTERSECT` combine two top sets, and `ADD` inserts the first popped set as one element of the second. After every operation, print the top set's cardinality. There are at most five cases and 2,000 operations per case.

## Building the approach

Copying recursive objects would be wasteful, while object addresses cannot establish mathematical equality. Instead, give every distinct set a canonical integer ID. Represent a set by the ordered `set<int>` of its members' canonical IDs, and maintain a map from that representation to its unique ID. The empty set is interned once.

The stack then stores only IDs. For `UNION` and `INTERSECT`, operate on the two represented ID sets. For `ADD`, copy the second popped set and insert the first popped set's ID as one member; do not flatten its contents. Intern every result rather than modifying an existing canonical value.

## Walkthrough

After `PUSH`, `DUP`, both stack entries identify the empty set. `ADD` inserts one empty set into the other, producing `{empty}` with size one. Duplicating that result and applying `ADD` produces `{empty, {empty}}`, whose size is two. A union at the first step would incorrectly remain empty.

## Why it works

Inductively, every allocated ID denotes exactly one mathematical set, and equal member-ID sets receive the same ID from the map. Each operation therefore acts on faithful canonical representations. Union and intersection preserve their definitions; `ADD` inserts the complete identity of its first operand into the second. Interning the result preserves uniqueness, so the printed representation size is exactly the top-level cardinality.

## Complexity

Let `Q` be the number of operations and `K` the largest represented set. A set operation and canonical lookup take conservatively `O(K log K + K log Q)` time. Storage is `O(QK)` in the worst case, with `O(Q)` stack entries.

## Common mistakes

- Flattening the first set during `ADD` as if it were a union.
- Reversing the two popped operands of `ADD`.
- Comparing allocation addresses instead of set contents.
- Mutating a canonical set shared by duplicated IDs.
- Omitting the `***` line for an empty operation case.
