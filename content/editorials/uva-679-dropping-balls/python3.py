import sys


values = list(map(int, sys.stdin.buffer.read().split()))
index = 1
for _ in range(values[0]):
    depth, number = values[index:index + 2]
    index += 2
    node = 1
    for _ in range(depth - 1):
        if number % 2:
            node *= 2
            number = (number + 1) // 2
        else:
            node = node * 2 + 1
            number //= 2
    print(node)
