import sys

values = list(map(int, sys.stdin.buffer.read().split()))
for index in range(0, len(values), 2):
    rows, columns = values[index:index + 2]
    if rows == 0 and columns == 0:
        break
    rows, columns = min(rows, columns), max(rows, columns)
    straight = rows * columns * (rows + columns - 2)
    diagonal = 4 * rows * (rows - 1) * (rows - 2) // 3
    diagonal += 2 * (columns - rows + 1) * rows * (rows - 1)
    print(straight + diagonal)
