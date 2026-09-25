import sys
lines = iter(sys.stdin.buffer.read().split())
out = []
for first in lines:
    rows = int(first)
    cols = int(next(lines))
    if rows == 0:
        break
    grid = [bytearray(next(lines)) for _ in range(rows)]
    answer = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != 64:
                continue
            answer += 1
            queue = [(r, c)]
            grid[r][c] = 42
            for y, x in queue:
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < rows and 0 <= nx < cols and grid[ny][nx] == 64:
                            grid[ny][nx] = 42
                            queue.append((ny, nx))
    out.append(str(answer))
sys.stdout.write('\n'.join(out))
