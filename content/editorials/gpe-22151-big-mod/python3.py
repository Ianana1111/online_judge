import sys

values = list(map(int, sys.stdin.buffer.read().split()))
for index in range(0, len(values), 3):
    base, exponent, modulus = values[index:index + 3]
    base %= modulus
    result = 1 % modulus
    while exponent > 0:
        if exponent & 1:
            result = result * base % modulus
        base = base * base % modulus
        exponent >>= 1
    print(result)
