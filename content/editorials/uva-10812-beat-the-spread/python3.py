import sys

values = list(map(int, sys.stdin.buffer.read().split()))
tests = values[0]
for index in range(tests):
    total, difference = values[1 + 2 * index:3 + 2 * index]
    if total < difference or (total - difference) % 2 != 0:
        print("impossible")
    else:
        lower = (total - difference) // 2
        higher = total - lower
        print(higher, lower)
