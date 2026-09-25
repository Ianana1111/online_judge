import sys


for number in sys.stdin.buffer.read().split():
    if number == b"0":
        break
    remainder = 0
    for digit in number:
        remainder = (remainder * 10 + digit - ord("0")) % 11
    sentence = b" is a multiple of 11.\n" if remainder == 0 else b" is not a multiple of 11.\n"
    sys.stdout.buffer.write(number + sentence)
