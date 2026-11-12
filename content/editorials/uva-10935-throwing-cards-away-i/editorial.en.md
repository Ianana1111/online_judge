# Simulate with a queue: discard the top, move the next card to the bottom

## Problem and constraints

A deck holds cards 1 to n with card 1 on top. While at least two cards remain, discard the top card and then move the new top card to the bottom. For each n, print the discarded cards in order and the last remaining card. The input ends with 0. This site reuses the official CPE test data, so n can be as large as 10000, and for n = 1 the first line is just `Discarded cards:`.

## Building the approach

The operations only touch the top and the bottom of the deck: cards leave from the top and are placed at the bottom. That is exactly a first-in, first-out queue. Push 1 through n in order and the front of the queue is the top of the deck.

Each round performs two queue operations: pop one card and record it as discarded, then pop the next card and push it to the back. Rounds continue while the queue holds at least two cards; the single card left at the end is the answer.

Every round is constant work and there are n − 1 rounds, so even n = 10000 is fast. The part that needs care is the format: one space after the colon, a comma and a space between cards, and no trailing comma or space.

## Walkthrough

For n = 7 the deck is 1 2 3 4 5 6 7. Discard 1 and move 2 to the bottom: 3 4 5 6 7 2. Discard 3 and move 4: 5 6 7 2 4. Discard 5: 7 2 4 6. Discard 7: 4 6 2. Discard 4: 2 6. Discard 2 and 6 remains. The discarded order 1, 3, 5, 7, 4, 2 and the remaining card 6 match the sample.

For n = 1 the deck already has a single card, nothing is discarded, the first line is `Discarded cards:` and the second line is `Remaining card: 1`.

## Why it works

The front of the queue always corresponds to the top of the deck and the back to the bottom. This holds after pushing 1 through n, and each round's two queue actions (remove the front, move the front to the back) are exactly the two deck actions in the statement, so the correspondence is preserved every round. The loop stops when fewer than two cards remain, which is the statement's stopping rule, so the recorded discards and the remaining card match the real process.

## Complexity

Each n takes n − 1 rounds of O(1) work, so O(n) time and O(n) queue space. Over all queries the total is O(Σn).

## Common mistakes

- Printing `Discarded cards: ` with a stray space, or a stray separator, when n = 1.
- Separating cards with a bare comma, or putting a comma before the first card.
- Looping while more than two cards remain and skipping the last round.
- Forgetting to move the next card to the bottom, which just discards cards in order.
