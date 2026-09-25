Convert indices to row and column. A reusable queen-reach function requires same row or column, different start and destination, destination not king, and king not strictly between endpoints.

First reject overlapping initial pieces, then an invalid queen path. If destination is Manhattan distance one from king, reject it as reachable by king. Otherwise enumerate the king's four in-board neighbors, excluding the queen square, and test whether the new queen can reach each. Any unattacked neighbor means Continue; none means Stop.

Apply classifications in order: overlapping start, queen path, forbidden king-adjacent landing, then king escape. The queen moves only along rows or columns and cannot cross the king.
