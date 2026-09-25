import sys
def fibonacci(n, mod):
    if n == 0:
        return 0, 1 % mod
    a, b = fibonacci(n // 2, mod)
    even = a * (2 * b - a) % mod
    odd = (a * a + b * b) % mod
    return (even, odd) if n % 2 == 0 else (odd, (even + odd) % mod)
data = list(map(int, sys.stdin.buffer.read().split()))
out = []
for i in range(0, len(data) - 1, 2):
    n, m = data[i], data[i + 1]
    out.append(str(fibonacci(n, 1 << m)[0]))
sys.stdout.write('\n'.join(out))
