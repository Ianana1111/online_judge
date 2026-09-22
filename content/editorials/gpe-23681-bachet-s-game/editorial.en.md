# A move to a losing state makes the current state winning

## Problem and constraints

Stan and Ollie alternately remove stones, with Stan moving first. A move must use one of the supplied positive quantities; it is not an arbitrary number up to the maximum. The player taking the last stone wins. There are at most ten move sizes, the set includes one, and the initial pile is at most one million. Cases continue to EOF.

## Building the approach

The future of the game depends only on the number of stones remaining, not the full history. Let `winning[s]` mean that the player whose turn begins with `s` stones can force a win.

With zero stones, the current player has no move and loses, so `winning[0]=false`. For positive `s`, if any legal removal `take<=s` reaches a losing state `winning[s-take]=false`, the current player chooses it and wins. If every legal successor is winning, every move gives the opponent a winning strategy and the state is losing.

Compute states in increasing stone count. All moves are positive, so every dependency has already been computed. Once one losing successor is found, no more moves need to be tested for that state.

## Walkthrough

With moves `{1,3,4}`, zero is losing and one is winning. At two stones, the only legal move leaves one, a winning state for the opponent, so two is losing. Three and four are winning because Stan can take the entire pile.

The common modulus shortcut based on the maximum move would fail here because taking two is not allowed.

## Why it works

Induct on `s`. The zero-state base is correct. For a positive state, if a move reaches a losing successor, the opponent cannot force a win from there, so the current player can. If all successors are winning, the opponent has a winning response after every possible move, so the current player cannot avoid defeat.

Every transition decreases `s`, making the induction acyclic and exhaustive. Therefore the table exactly describes optimal play, and `winning[n]` determines whether Stan or Ollie wins.

## Complexity

For pile size `n` and `m` move types, time is `O(nm)` and storage is `O(n)`. A byte-sized state array uses roughly one megabyte at the maximum.

## Common mistakes

- Applying a modulus formula that assumes every size from one to a maximum is legal.
- Treating taking the last stone as a loss.
- Calling a state winning when it moves to another winning state.
- Using a move larger than the current pile.
- Playing greedily rather than analyzing optimal replies.
