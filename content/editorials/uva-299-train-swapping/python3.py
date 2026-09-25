import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    index = 1
    for _ in range(values[0]):
        n = values[index]
        index += 1
        cars = values[index:index + n]
        index += n
        swaps = 0
        for i in range(n):
            for j in range(i + 1, n):
                if cars[i] > cars[j]:
                    swaps += 1
        print(f"Optimal train swapping takes {swaps} swaps.")
