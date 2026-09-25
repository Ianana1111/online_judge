import sys

factorial = 1
sums = [0] * 1001
sums[0] = 1
for n in range(1, 1001):
    factorial *= n
    sums[n] = sum(int(digit) for digit in str(factorial))
for token in sys.stdin.buffer.read().split():
    print(sums[int(token)])
