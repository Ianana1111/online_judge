import sys


for token in sys.stdin.buffer.read().split():
    count = int(token)
    row = (count + 1) // 2
    last = 2 * row * row - 1
    print(3 * last - 6)
