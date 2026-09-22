import sys

data = list(map(int, sys.stdin.buffer.read().split()))
position = 1
output = []
for _ in range(data[0]):
    wall = [[0] * (r + 1) for r in range(9)]
    for r in range(0, 9, 2):
        for c in range(0, r + 1, 2):
            wall[r][c] = data[position]
            position += 1
    for r in range(6, -1, -2):
        for c in range(0, r + 1, 2):
            left = wall[r + 2][c]
            right = wall[r + 2][c + 2]
            middle = (wall[r][c] - left - right) // 2
            wall[r + 2][c + 1] = middle
            wall[r + 1][c] = left + middle
            wall[r + 1][c + 1] = middle + right
    output.extend(" ".join(map(str, row)) for row in wall)
sys.stdout.write("\n".join(output) + ("\n" if output else ""))
