First distinguish a whole die from one pip. The outer BFS crosses every non-background pixel to collect a die; the inner BFS crosses only `X`. Thus a large connected patch of `X` counts once, while two patches separated by `*` count separately.

Use separate visited tables for the two searches and do not overwrite the picture. Add one count per die, sort the list, and retain duplicates when different dice show the same number of pips.
