import sys
data = list(map(int, sys.stdin.buffer.read().split()))
i = 0
out = []
while i < len(data):
    n = data[i]; i += 1
    if n == 0:
        break
    grid = [data[i + r * n:i + (r + 1) * n] for r in range(n)]
    i += n * n
    best = -10**18
    for top in range(n):
        columns = [0] * n
        for bottom in range(top, n):
            for c in range(n):
                columns[c] += grid[bottom][c]
            ending = columns[0]
            best = max(best, ending)
            for value in columns[1:]:
                ending = max(value, ending + value)
                best = max(best, ending)
    out.append(str(best))
sys.stdout.write('\n'.join(out))
