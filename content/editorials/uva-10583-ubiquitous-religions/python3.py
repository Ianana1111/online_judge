import sys
data = list(map(int, sys.stdin.buffer.read().split()))
out = []
i = 0
case_no = 0
while i + 1 < len(data):
    n, m = data[i], data[i + 1]
    i += 2
    if n == 0 and m == 0:
        break
    parent = list(range(n + 1))
    size = [1] * (n + 1)
    groups = n
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for _ in range(m):
        a, b = find(data[i]), find(data[i + 1])
        i += 2
        if a != b:
            if size[a] < size[b]:
                a, b = b, a
            parent[b] = a
            size[a] += size[b]
            groups -= 1
    case_no += 1
    out.append(f'Case {case_no}: {groups}')
sys.stdout.write('\n'.join(out))
