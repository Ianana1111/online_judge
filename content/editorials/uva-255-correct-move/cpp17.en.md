`queenCanReach` serves both proposed movement and attack tests. Row and column branches use strict `min<king<max` blocking after excluding the king destination itself.

King neighbors are constructed from row/column offsets and bounds-checked before conversion, preventing wraparound. Queen attack tests keep the current king square as a blocker. `escape` needs only one valid neighbor, and each earlier output branch immediately continues to preserve priority.
