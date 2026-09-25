import sys

safe = [0] * 31
safe[0], safe[1], safe[2] = 1, 2, 4
for length in range(3, 31):
    safe[length] = safe[length - 1] + safe[length - 2] + safe[length - 3]
for token in sys.stdin.buffer.read().split():
    n = int(token)
    if n == 0:
        break
    print((1 << n) - safe[n])
