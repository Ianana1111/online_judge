import sys
data = sys.stdin.buffer.read().split()
if not data:
    sys.exit()
i = 1
groups = []
for _ in range(int(data[0])):
    rows, cols, days = map(int, data[i:i + 3]); i += 3
    grid = [bytearray(data[i + r]) for r in range(rows)]
    i += rows
    for _ in range(days):
        next_grid = [row.copy() for row in grid]
        for r in range(rows):
            for c in range(cols):
                enemy = 80 if grid[r][c] == 82 else 83 if grid[r][c] == 80 else 82
                for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == enemy:
                        next_grid[r][c] = enemy
        grid = next_grid
    groups.append('\n'.join(row.decode() for row in grid))
sys.stdout.write('\n\n'.join(groups))
