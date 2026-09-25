import sys


def count_bits(value):
    count = 0
    while value > 0:
        count += value % 2
        value //= 2
    return count


tokens = sys.stdin.buffer.read().split()
for digits in tokens[1:1 + int(tokens[0])]:
    decimal = 0
    hexadecimal = 0
    for character in digits:
        digit = character - ord("0")
        decimal = decimal * 10 + digit
        hexadecimal = hexadecimal * 16 + digit
    print(count_bits(decimal), count_bits(hexadecimal))
