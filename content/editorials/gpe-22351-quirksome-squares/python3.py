import sys

for token in sys.stdin.buffer.read().split():
    digits = int(token)
    base = 10 ** (digits // 2)
    for root in range(base):
        value = root * root
        if value // base + value % base == root:
            print(f"{value:0{digits}d}")
