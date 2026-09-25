import sys
composite = bytearray(10002)
primes = []
for value in range(2, 10002):
    if not composite[value]:
        primes.append(value)
        if value <= 100:
            for multiple in range(value * value, 10002, value):
                composite[multiple] = 1
prefix = [0] * 10002
for n in range(10001):
    value = n * n + n + 41
    prime = True
    for divisor in primes:
        if divisor * divisor > value:
            break
        if value % divisor == 0:
            prime = False
            break
    prefix[n + 1] = prefix[n] + prime
data = list(map(int, sys.stdin.buffer.read().split()))
out = []
for i in range(0, len(data) - 1, 2):
    a, b = data[i], data[i + 1]
    numerator = 10000 * (prefix[b + 1] - prefix[a])
    denominator = b - a + 1
    hundredths = (2 * numerator + denominator) // (2 * denominator)
    out.append(f'{hundredths // 100}.{hundredths % 100:02d}')
sys.stdout.write('\n'.join(out))
