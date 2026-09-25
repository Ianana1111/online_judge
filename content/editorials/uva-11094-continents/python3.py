import sys
lines = iter(sys.stdin.buffer.read().split())
out = []
for first in lines:
    rows = int(first)
    cols = int(next(lines))
    grid = [next(lines) for _ in range(rows)]
    sy, sx = int(next(lines)), int(next(lines))
    land = grid[sy][sx]
    seen = [bytearray(cols) for _ in range(rows)]
    def flood(y, x):
        queue = [(y, x)]
        seen[y][x] = 1
        front = 0
        while front < len(queue):
            r, c = queue[front]
            front += 1
            for nr, nc in ((r - 1, c), (r + 1, c), (r, (c - 1) % cols), (r, (c + 1) % cols)):
                if 0 <= nr < rows and not seen[nr][nc] and grid[nr][nc] == land:
                    seen[nr][nc] = 1
                    queue.append((nr, nc))
        return len(queue)
    flood(sy, sx)
    best = 0
    for y in range(rows):
        for x in range(cols):
            if not seen[y][x] and grid[y][x] == land:
                best = max(best, flood(y, x))
    out.append(str(best))
sys.stdout.write('\n'.join(out))
