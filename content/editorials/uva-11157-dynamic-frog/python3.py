import sys
data = sys.stdin.buffer.read().split()
if not data:
    sys.exit()
i = 1
out = []
for tc in range(1, int(data[0]) + 1):
    n, distance = int(data[i]), int(data[i + 1]); i += 2
    points = [0, 0]
    for _ in range(n):
        type_, position = data[i].split(b'-'); i += 1
        position = int(position)
        points.append(position)
        if type_ == b'B':
            points.append(position)
    points.extend((distance, distance))
    best = max(points[j] - points[j - 2] for j in range(2, len(points)))
    out.append(f'Case {tc}: {best}')
sys.stdout.write('\n'.join(out))
