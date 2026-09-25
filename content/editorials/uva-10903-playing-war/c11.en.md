Maintain win and loss counters. If both moves match, skip the game. Otherwise player one wins exactly in the three cases rock over scissors, scissors over paper, and paper over rock; every other non-draw belongs to player two.

After all games, process players in numeric order. A zero decisive-game count has undefined ratio and prints a dash. Otherwise format the exact rational `wins/(wins+losses)` to three decimals. Integer rational rounding avoids relying on binary floating behavior at an exact midpoint.

All scheduled games must be consumed, including draws. For `N=1`, the schedule contains zero games but the one player still needs an output line.

Ties count for neither player. Update both records using the three cyclic winning pairs, then round the win ratio to three decimals with integer arithmetic. Print a dash for a player with no decisive game.
