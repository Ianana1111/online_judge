import sys
digits = '0123456789ABCDEF'
data = sys.stdin.buffer.read().split()
out = []
for i in range(0, len(data) - 2, 3):
    source = data[i].decode()
    from_base = int(data[i + 1])
    to_base = int(data[i + 2])
    modulus = to_base ** 7
    value = 0
    for ch in source:
        value = (value * from_base + digits.index(ch)) % modulus
    result = ['0'] * 7
    for position in range(6, -1, -1):
        result[position] = digits[value % to_base]
        value //= to_base
    out.append(''.join(result))
sys.stdout.write('\n'.join(out))
