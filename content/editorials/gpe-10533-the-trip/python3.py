import sys
data = sys.stdin.buffer.read().split()
i = 0
out = []
while i < len(data):
    n = int(data[i]); i += 1
    if n == 0:
        break
    paid = []
    for _ in range(n):
        dollars, cents = data[i].split(b'.')
        paid.append(int(dollars) * 100 + int(cents))
        i += 1
    total = sum(paid)
    low = total // n
    high = (total + n - 1) // n
    give = sum(max(0, value - high) for value in paid)
    receive = sum(max(0, low - value) for value in paid)
    answer = max(give, receive)
    out.append(f'${answer // 100}.{answer % 100:02d}')
sys.stdout.write('\n'.join(out))
