import sys

for number in sys.stdin.buffer.read().split():
    if number == b'0':
        break
    total = sum(digit - ord('0') for digit in number)
    if total % 9 != 0:
        sys.stdout.buffer.write(number + b' is not a multiple of 9.\n')
    else:
        degree = 1
        while total != 9:
            total = sum(map(int, str(total)))
            degree += 1
        sys.stdout.buffer.write(number + f" is a multiple of 9 and has 9-degree {degree}.\n".encode())
