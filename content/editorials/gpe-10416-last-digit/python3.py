import sys
prefix = [0] * 100
for i in range(1, 100):
    prefix[i] = (prefix[i - 1] + pow(i, i, 10)) % 10
out = []
for number in sys.stdin.buffer.read().split():
    if all(ch == 48 for ch in number):
        break
    remainder = 0
    for digit in number:
        remainder = (remainder * 10 + digit - 48) % 100
    out.append(str(prefix[remainder]))
sys.stdout.write('\n'.join(out))
