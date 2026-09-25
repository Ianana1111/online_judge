import sys

tokens = sys.stdin.buffer.read().split()
if tokens:
    index = 1
    for _ in range(int(tokens[0])):
        number = tokens[index]
        count = int(tokens[index + 1])
        index += 2
        divisors = [int(x) for x in tokens[index:index + count]]
        index += count
        wonderful = True
        for divisor in divisors:
            remainder = 0
            for digit in number:
                remainder = (10 * remainder + digit - ord('0')) % divisor
            if remainder != 0:
                wonderful = False
        sys.stdout.buffer.write(number + (b' - Wonderful.\n' if wonderful else b' - Simple.\n'))
