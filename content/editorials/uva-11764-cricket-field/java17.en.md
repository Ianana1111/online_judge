Read the first height into `previous`. For each later `current` height, increment `high` when `current>previous`, increment `low` when `current<previous`, and do nothing on equality. Then always assign `previous=current` so the next comparison uses adjacent walls.

There are exactly `N-1` jumps. Reaching the first wall is the starting position, not a jump from ground level, and the magnitude of a height difference does not affect the count.

Case numbering starts at one, and output places high jumps before low jumps.
