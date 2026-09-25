import sys


def odd_prefix(bound):
    count = (bound + 1) // 2
    return count * count


values = list(map(int, sys.stdin.buffer.read().split()))
index = 1
for case_number in range(1, values[0] + 1):
    low, high = values[index:index + 2]
    index += 2
    print(f"Case {case_number}: {odd_prefix(high) - odd_prefix(low - 1)}")
