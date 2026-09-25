import sys
lines = sys.stdin.buffer.read().decode().splitlines()
tests = int(lines[0])
position = 1
out = []
for _ in range(tests):
    while position < len(lines) and not lines[position].strip():
        position += 1
    n = int(lines[position]); position += 1
    parent = list(range(n + 1))
    size = [1] * (n + 1)
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    yes = no = 0
    while position < len(lines) and lines[position].strip():
        op, a, b = lines[position].split()
        position += 1
        a, b = find(int(a)), find(int(b))
        if op == 'q':
            if a == b:
                yes += 1
            else:
                no += 1
        elif a != b:
            if size[a] < size[b]:
                a, b = b, a
            parent[b] = a
            size[a] += size[b]
    out.append(f'{yes},{no}')
sys.stdout.write('\n\n'.join(out))
