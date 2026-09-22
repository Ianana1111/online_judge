One-based coordinates are converted only when indexing the row strings. The flood-fill branch converts its start to zero-based coordinates once, then uses width and height for explicit neighbor bounds.

Every command is parsed from a separate `istringstream`. An unknown operation has no matching branch, so execution proceeds to the next physical input line and safely ignores all of its parameters.

For flood fill, the start and every accepted neighbor are recolored before entering the queue. Because `old != color`, a visited cell can never match `old` again. `S` only prints the current rows; `I` replaces both dimensions and contents, while `C` replaces only pixel colors.
