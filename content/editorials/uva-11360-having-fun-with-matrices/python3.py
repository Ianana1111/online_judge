import sys
data = sys.stdin.buffer.read().split()
if not data:
    sys.exit()
i = 1
out = []
for tc in range(1, int(data[0]) + 1):
    n = int(data[i]); i += 1
    a = [[digit - 48 for digit in data[i + r]] for r in range(n)]
    i += n
    commands = int(data[i]); i += 1
    for _ in range(commands):
        op = data[i]; i += 1
        if op in (b'row', b'col'):
            x, y = int(data[i]) - 1, int(data[i + 1]) - 1
            i += 2
            if op == b'row':
                a[x], a[y] = a[y], a[x]
            else:
                for row in a:
                    row[x], row[y] = row[y], row[x]
        elif op == b'transpose':
            for r in range(n):
                for c in range(r + 1, n):
                    a[r][c], a[c][r] = a[c][r], a[r][c]
        else:
            delta = 1 if op == b'inc' else 9
            for row in a:
                for c in range(n):
                    row[c] = (row[c] + delta) % 10
    out.append(f'Case #{tc}')
    out.extend(''.join(map(str, row)) for row in a)
    out.append('')
sys.stdout.write('\n'.join(out) + ('\n' if out else ''))
