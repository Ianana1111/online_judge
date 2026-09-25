import sys

for token in sys.stdin.buffer.read().split():
    difference = int(token)
    if difference == 0:
        break
    quotient, remainder = divmod(difference, 9)
    if remainder == 0:
        print(10 * quotient - 1, 10 * quotient)
    else:
        print(10 * quotient + remainder)
