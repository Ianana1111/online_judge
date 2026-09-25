import sys

values = list(map(int, sys.stdin.buffer.read().split()))
for index in range(0, len(values), 2):
    start, day = values[index:index + 2]
    low, high = start, 100000000
    while low < high:
        mid = (low + high) // 2
        through = (mid - start + 1) * (start + mid) // 2
        if through >= day:
            high = mid
        else:
            low = mid + 1
    print(low)
