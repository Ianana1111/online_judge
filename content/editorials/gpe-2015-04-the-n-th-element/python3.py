import sys
data = list(map(int, sys.stdin.buffer.read().split()))
if not data:
    sys.exit()
i = 1
out = []
for _ in range(data[0]):
    a = data[i:i + 3]
    b = data[i + 3:i + 6]
    n = data[i + 6]
    i += 7
    def value(coefficients, index):
        return coefficients[0] * index * index + coefficients[1] * index + coefficients[2]
    low, high = 0, n
    while low <= high:
        take_a = (low + high) // 2
        take_b = n - take_a
        al = value(a, take_a - 1) if take_a else float('-inf')
        ar = value(a, take_a) if take_a < n else float('inf')
        bl = value(b, take_b - 1) if take_b else float('-inf')
        br = value(b, take_b) if take_b < n else float('inf')
        if al > br:
            high = take_a - 1
        elif bl > ar:
            low = take_a + 1
        else:
            out.append(str(max(al, bl)))
            break
sys.stdout.write('\n'.join(out))
