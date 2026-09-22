# Decode a move-to-front dictionary with a Fenwick tree

## Problem and constraints

The compressed article contains no literal digits from the original text. A word is a maximal run of ASCII letters and is case-sensitive. Its first occurrence remains literal and is inserted at the front of a dictionary; later occurrences are replaced by their current one-based dictionary position, then moved to the front. Nonletters, punctuation, whitespace, and newlines must be copied exactly. A line containing only `0` terminates input and is not output. The number of distinct words is unbounded by a small constant.

## Building the approach

A plain list supports the rule directly but locating and moving entries can become quadratic. First read the compressed text and count `W` word events, where either a literal word or a complete number is one event. Reserve `W` ordered positions. Every event moved to the front receives the next unused position from right to left, so smaller active positions represent more recently used words.

A Fenwick tree stores one at each active position and zero at deleted positions. For numeric reference `k`, find the position of the k-th active one using Fenwick binary lifting, take its word, delete that old position, and insert it at the new smallest position. Literal words are inserted directly at a new position.

Every character that is neither a letter nor digit is emitted immediately and unchanged.

## Walkthrough

`red blue 2 2` decodes to `red blue red blue`. After the literals, the dictionary is `[blue,red]`; reference 2 retrieves red and moves it to front, producing `[red,blue]`; the next 2 then retrieves blue.

Failing to move the referenced word would decode the last token as red. `Red` and `red` remain separate dictionary entries.

## Why it works

Induct after each word event that active positions in increasing order equal the move-to-front dictionary. A literal receives a position smaller than every active one, exactly inserting it first. A numeric event selects the k-th active position, deletes it, and reinserts the same word at the newest smallest position, exactly matching lookup and move-to-front.

Both operations preserve the invariant, so every emitted word is correct. Separators bypass the dictionary and are copied byte for byte, preserving the article layout.

## Complexity

For compressed length `L`, event count `W`, and output length `R`, scanning and output take `O(L+R)`, dictionary operations take `O(W log W)`, and storage is `O(L+W)`.

## Common mistakes

- Treating an index as original insertion order.
- Inserting a moved word without deleting its old occurrence.
- Tokenizing only by spaces and losing punctuation or newlines.
- Converting all words to one case.
- Outputting the terminating zero line.
- Assuming references are single-digit or the dictionary is tiny.
