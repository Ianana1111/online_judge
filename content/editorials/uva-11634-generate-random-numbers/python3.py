import sys

for token in sys.stdin.buffer.read().split():
    value = int(token)
    if value == 0:
        break
    seen = [False] * 10000
    count = 0
    while not seen[value]:
        seen[value] = True
        count += 1
        value = (value * value // 100) % 10000
    print(count)
