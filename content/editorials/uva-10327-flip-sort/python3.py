import sys

tokens = list(map(int, sys.stdin.buffer.read().split()))
index = 0
while index < len(tokens):
    n = tokens[index]
    index += 1
    values = tokens[index:index + n]
    index += n
    inversions = 0
    for i in range(n):
        for j in range(i + 1, n):
            if values[i] > values[j]:
                inversions += 1
    print(f"Minimum exchange operations : {inversions}")
