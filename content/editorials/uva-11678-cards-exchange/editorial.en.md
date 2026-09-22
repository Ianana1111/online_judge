# Deduplicate cards and take the smaller exclusive set

## Problem and constraints

Each person owns a multiset of card IDs. In one exchange, both offer the same number of distinct types that the other person does not already own. Find the maximum number each can exchange. Each input list has up to 10,000 cards and may contain duplicates; `0 0` terminates input.

## Building the approach

Convert both collections to sets because duplicate copies of one ID do not provide another new type. Alice can offer types in `A-B`, and Betty can offer types in `B-A`. Every traded item on one side must pair with one on the other, so the smaller exclusive-set size limits the exchange.

Shared types create no new ownership and belong to neither candidate set. Extra exclusive types on the larger side cannot be traded without matching items from the other side.

## Walkthrough

Alice has `1,1,2,5` and Betty has `2,3,3,4`. After deduplication, Alice-exclusive types are 1 and 5; Betty-exclusive types are 3 and 4, so each can exchange two. If Alice has only 1 while Betty has 1,2,3, Alice has no type Betty lacks, so the answer is zero.

## Why it works

Every legal card offered by Alice must belong to `A-B`, and every legal card from Betty to `B-A`; therefore no exchange exceeds either set's size. Conversely, choose any equal number up to the smaller size from both difference sets. Every chosen type is distinct and absent from its recipient, and arbitrary one-to-one pairing forms a legal exchange. The upper bound is attainable.

## Complexity

Using ordered sets takes `O((N+M)log(N+M))` time and `O(N+M)` space.

## Common mistakes

- Counting duplicate cards rather than distinct types.
- Taking `min(|A|,|B|)` without removing common types.
- Adding both difference sizes instead of matching equal counts.
- Taking the larger difference size.
- Reusing sets across datasets.
