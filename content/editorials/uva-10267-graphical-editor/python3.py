import sys
from collections import deque

image = []
output = []
directions = ((-1, 0), (1, 0), (0, -1), (0, 1))
for line in sys.stdin:
    parts = line.split()
    if not parts:
        continue
    op = parts[0]
    if op == "X":
        break
    if op == "I":
        width, height = map(int, parts[1:3])
        image = [["O"] * width for _ in range(height)]
    elif op == "C":
        for row in image:
            row[:] = ["O"] * len(row)
    elif op == "S":
        output.append(parts[1])
        output.extend("".join(row) for row in image)
    elif op == "L":
        x, y = map(int, parts[1:3])
        image[y - 1][x - 1] = parts[3]
    elif op == "V":
        x, y1, y2 = map(int, parts[1:4])
        for y in range(min(y1, y2), max(y1, y2) + 1):
            image[y - 1][x - 1] = parts[4]
    elif op == "H":
        x1, x2, y = map(int, parts[1:4])
        for x in range(min(x1, x2), max(x1, x2) + 1):
            image[y - 1][x - 1] = parts[4]
    elif op == "K":
        x1, y1, x2, y2 = map(int, parts[1:5])
        for y in range(y1 - 1, y2):
            for x in range(x1 - 1, x2):
                image[y][x] = parts[5]
    elif op == "F":
        x, y = map(int, parts[1:3])
        x -= 1
        y -= 1
        color = parts[3]
        old = image[y][x]
        if old == color:
            continue
        image[y][x] = color
        pending = deque([(y, x)])
        while pending:
            cy, cx = pending.popleft()
            for dy, dx in directions:
                ny, nx = cy + dy, cx + dx
                if 0 <= ny < len(image) and 0 <= nx < len(image[ny]) and image[ny][nx] == old:
                    image[ny][nx] = color
                    pending.append((ny, nx))
sys.stdout.write("\n".join(output) + ("\n" if output else ""))
