import sys
data = list(map(int, sys.stdin.buffer.read().split()))
if not data:
    sys.exit()
i = 1
out = []
for _ in range(data[0]):
    n = data[i]; i += 1
    values = data[i:i + n]; i += n
    up = [1] * n
    for x in range(n - 1, -1, -1):
        for y in range(x + 1, n):
            if values[y] > values[x]:
                up[x] = max(up[x], up[y] + 1)
    best = max(up)
    answers = []
    path = []
    def visit(start, remaining):
        if remaining == 0:
            answers.append(path.copy())
            return
        for x in range(start, n):
            if up[x] == remaining and (not path or values[x] > path[-1]):
                path.append(values[x])
                visit(x + 1, remaining - 1)
                path.pop()
    visit(0, best)
    out.append(str(len(answers)))
    for answer in answers:
        out.append(' '.join(map(str, answer)))
sys.stdout.write('\n'.join(out))
