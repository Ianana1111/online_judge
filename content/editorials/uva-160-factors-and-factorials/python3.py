import sys
primes = []
composite = bytearray(101)
for value in range(2, 101):
    if not composite[value]:
        primes.append(value)
        for multiple in range(value * value, 101, value):
            composite[multiple] = 1
out = []
for token in sys.stdin.buffer.read().split():
    n = int(token)
    if n == 0:
        break
    line = f'{n:3d}! ='
    column = 0
    for prime in primes:
        if prime > n:
            break
        exponent = 0
        quotient = n // prime
        while quotient:
            exponent += quotient
            quotient //= prime
        if column == 15:
            out.append(line)
            line = '      '
            column = 0
        line += f'{exponent:3d}'
        column += 1
    out.append(line)
sys.stdout.write('\n'.join(out))
