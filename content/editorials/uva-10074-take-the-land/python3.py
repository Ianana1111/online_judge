import sys
data = list(map(int, sys.stdin.buffer.read().split()))
i = 0
out = []
while i + 1 < len(data):
    rows, cols = data[i], data[i + 1]
    i += 2
    if rows == 0 and cols == 0:
        break
    grid = [data[i + r * cols:i + (r + 1) * cols] for r in range(rows)]
    i += rows * cols
    best = 0
    for top in range(rows):
        clear = [True] * cols
        for bottom in range(top, rows):
            width = 0
            for c in range(cols):
                clear[c] = clear[c] and grid[bottom][c] == 0
                width = width + 1 if clear[c] else 0
                best = max(best, width * (bottom - top + 1))
    out.append(str(best))
sys.stdout.write('\n'.join(out))
