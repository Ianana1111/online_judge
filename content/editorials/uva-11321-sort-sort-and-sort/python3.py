import sys
data = list(map(int, sys.stdin.buffer.read().split()))
i = 0
out = []
while i + 1 < len(data):
    n, modulus = data[i], data[i + 1]
    i += 2
    out.append(f'{n} {modulus}')
    if n == 0 and modulus == 0:
        break
    values = data[i:i + n]
    i += n
    def signed_remainder(value):
        return value % modulus if value >= 0 else -((-value) % modulus)
    values.sort(key=lambda value: (signed_remainder(value),
                                   0 if value % 2 else 1,
                                   -value if value % 2 else value))
    out.extend(map(str, values))
sys.stdout.write('\n'.join(out))
