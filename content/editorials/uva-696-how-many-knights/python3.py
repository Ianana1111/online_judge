import sys

values = list(map(int, sys.stdin.buffer.read().split()))
for index in range(0, len(values), 2):
    rows, columns = values[index:index + 2]
    if rows == 0 and columns == 0:
        break
    shorter, longer = min(rows, columns), max(rows, columns)
    if shorter == 0:
        answer = 0
    elif shorter == 1:
        answer = longer
    elif shorter == 2:
        answer = 4 * (longer // 4) + min(4, 2 * (longer % 4))
    else:
        answer = (rows * columns + 1) // 2
    print(f"{answer} knights may be placed on a {rows} row {columns} column board.")
