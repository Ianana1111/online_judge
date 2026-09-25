import sys

for token in sys.stdin.buffer.read().split():
    total = int(token)
    if total == 0:
        break
    low, high = 1, 20000
    while low < high:
        mid = (low + high) // 2
        if mid * (mid + 1) // 2 > total:
            high = mid
        else:
            low = mid + 1
    pages = low
    missing = pages * (pages + 1) // 2 - total
    print(missing, pages)
