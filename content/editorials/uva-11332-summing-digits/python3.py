import sys

for token in sys.stdin.buffer.read().split():
    value = int(token)
    if value == 0:
        break
    while value >= 10:
        digit_sum = 0
        while value > 0:
            digit_sum += value % 10
            value //= 10
        value = digit_sum
    print(value)
