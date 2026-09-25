import sys
data = list(map(int, sys.stdin.buffer.read().split()))
if not data:
    sys.exit()
i = 1
out = []
for _ in range(data[0]):
    n, m, pushes = data[i:i + 3]
    i += 3
    edges = [[] for _ in range(n + 1)]
    for _ in range(m):
        a, b = data[i], data[i + 1]
        i += 2
        edges[a].append(b)
    seen = bytearray(n + 1)
    queue = []
    for _ in range(pushes):
        x = data[i]
        i += 1
        if not seen[x]:
            seen[x] = 1
            queue.append(x)
    front = 0
    while front < len(queue):
        x = queue[front]
        front += 1
        for y in edges[x]:
            if not seen[y]:
                seen[y] = 1
                queue.append(y)
    out.append(str(len(queue)))
sys.stdout.write('\n'.join(out))
