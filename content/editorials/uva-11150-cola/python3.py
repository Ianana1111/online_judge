import sys


for token in sys.stdin.buffer.read().split():
    bottles = int(token)
    print(bottles + bottles // 2)
