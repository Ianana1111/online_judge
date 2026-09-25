import sys


for token in sys.stdin.buffer.read().split():
    cuts = int(token)
    if cuts < 0:
        break
    print(1 + cuts * (cuts + 1) // 2)
