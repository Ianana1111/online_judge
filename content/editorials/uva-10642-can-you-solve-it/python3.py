import sys


def position(x, y):
    diagonal = x + y
    return diagonal * (diagonal + 1) // 2 + x


values = list(map(int, sys.stdin.buffer.read().split()))
index = 1
for case_number in range(1, values[0] + 1):
    x, y, a, b = values[index:index + 4]
    index += 4
    print(f"Case {case_number}: {position(a, b) - position(x, y)}")
