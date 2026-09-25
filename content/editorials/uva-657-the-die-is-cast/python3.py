import sys
from collections import deque

tokens = iter(sys.stdin.buffer.read().split())
output = []
case = 0
directions = ((-1, 0), (1, 0), (0, -1), (0, 1))
for raw_width in tokens:
    width = int(raw_width)
    height = int(next(tokens))
    if width == height == 0:
        break
    grid = [next(tokens) for _ in range(height)]
    die_seen = [[False] * width for _ in range(height)]
    pip_seen = [[False] * width for _ in range(height)]
    answers = []
    for sr in range(height):
        for sc in range(width):
            if grid[sr][sc] == ord('.') or die_seen[sr][sc]:
                continue
            die_seen[sr][sc] = True
            pending = deque([(sr, sc)])
            cells = []
            while pending:
                r, c = pending.popleft()
                cells.append((r, c))
                for dr, dc in directions:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < height and 0 <= nc < width and grid[nr][nc] != ord('.') and not die_seen[nr][nc]:
                        die_seen[nr][nc] = True
                        pending.append((nr, nc))
            dots = 0
            for r, c in cells:
                if grid[r][c] != ord('X') or pip_seen[r][c]:
                    continue
                dots += 1
                pip_seen[r][c] = True
                pending = deque([(r, c)])
                while pending:
                    x, y = pending.popleft()
                    for dr, dc in directions:
                        nx, ny = x + dr, y + dc
                        if 0 <= nx < height and 0 <= ny < width and grid[nx][ny] == ord('X') and not pip_seen[nx][ny]:
                            pip_seen[nx][ny] = True
                            pending.append((nx, ny))
            answers.append(dots)
    case += 1
    output.append(f"Throw {case}\n" + " ".join(map(str, sorted(answers))))
sys.stdout.write("\n\n".join(output) + ("\n\n" if output else ""))
