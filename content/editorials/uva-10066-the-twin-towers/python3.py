import sys
data = list(map(int, sys.stdin.buffer.read().split()))
i = 0
case_no = 0
out = []
while i + 1 < len(data):
    n, m = data[i], data[i + 1]
    i += 2
    if n == 0 and m == 0:
        break
    a = data[i:i + n]; i += n
    b = data[i:i + m]; i += m
    previous = [0] * (m + 1)
    for value in a:
        current = [0] * (m + 1)
        for j, other in enumerate(b, 1):
            current[j] = previous[j - 1] + 1 if value == other else max(previous[j], current[j - 1])
        previous = current
    case_no += 1
    out.append(f'Twin Towers #{case_no}\nNumber of Tiles : {previous[m]}\n')
sys.stdout.write('\n'.join(out) + ('\n' if out else ''))
