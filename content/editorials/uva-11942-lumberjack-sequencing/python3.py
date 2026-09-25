import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    print('Lumberjacks:')
    for case_number in range(values[0]):
        start = 1 + 10 * case_number
        row = values[start:start + 10]
        increasing = all(row[i] > row[i - 1] for i in range(1, 10))
        decreasing = all(row[i] < row[i - 1] for i in range(1, 10))
        print('Ordered' if increasing or decreasing else 'Unordered')
