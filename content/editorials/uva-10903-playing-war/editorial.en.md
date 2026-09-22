# Count decisive wins and losses, excluding every draw

## Problem and constraints

This problem is Rock-Paper-Scissors Tournament despite the legacy slug. Up to 100 players play `K` games per unordered pair. A player's ratio is wins divided by wins plus losses; draws are excluded entirely. Print three decimals per player, `-` when the denominator is zero, and a blank line between cases.

## Building the approach

Maintain win and loss counters. If both moves match, skip the game. Otherwise player one wins exactly in the three cases rock over scissors, scissors over paper, and paper over rock; every other non-draw belongs to player two.

After all games, process players in numeric order. A zero decisive-game count has undefined ratio and prints a dash. Otherwise format the exact rational `wins/(wins+losses)` to three decimals. Integer rational rounding avoids relying on binary floating behavior at an exact midpoint.

All scheduled games must be consumed, including draws. For `N=1`, the schedule contains zero games but the one player still needs an output line.

## Walkthrough

A player with one win, two losses, and one draw has ratio `1/3`, not `1/4`, and prints `0.333`. A player with only draws prints `-`.

One win and fifteen losses gives exact 0.0625; the reference's half-up choice prints `0.063`, while the checker also recognizes the equally near midpoint alternative.

## Why it works

Every game is either a draw or has exactly one winner and loser. The three listed cyclic cases exhaust player one's wins, and all other nonmatching pairs are player-two wins, so counters equal the true decisive results. Draws change neither counter and therefore do not enter the denominator.

The final branch precisely matches whether the ratio is defined, and exact rational formatting yields the required nearest three-decimal value for every player in input order.

## Complexity

For `G=K*N*(N-1)/2` games, time is `O(G+N)` and counter space is `O(N)`.

## Common mistakes

- Counting draws as losses or including them in the denominator.
- Printing `0.000` for a player with no decisive games.
- Assuming the first listed player wins.
- Reversing the dominance cycle.
- Trying to read a game when `N=1`.
