import sys
data = list(map(int, sys.stdin.buffer.read().split()))
if not data:
    sys.exit()
i = 1
out = []
for _ in range(data[0]):
    n, k = data[i], data[i + 1]
    i += 2
    possible = bytearray(k)
    possible[data[i] % k] = 1
    i += 1
    for _ in range(n - 1):
        value = data[i] % k
        i += 1
        next_possible = bytearray(k)
        for r in range(k):
            if possible[r]:
                next_possible[(r + value) % k] = 1
                next_possible[(r - value) % k] = 1
        possible = next_possible
    out.append('Divisible' if possible[0] else 'Not divisible')
sys.stdout.write('\n'.join(out))
