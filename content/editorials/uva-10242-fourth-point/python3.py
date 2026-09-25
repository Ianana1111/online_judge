import sys
def millimetres(token):
    sign = -1 if token.startswith(b'-') else 1
    if sign < 0:
        token = token[1:]
    whole, dot, fraction = token.partition(b'.')
    return sign * (int(whole) * 1000 + int((fraction + b'000')[:3]))
data = sys.stdin.buffer.read().split()
out = []
for start in range(0, len(data), 8):
    if start + 8 > len(data):
        break
    numbers = [millimetres(token) for token in data[start:start + 8]]
    points = [(numbers[i], numbers[i + 1]) for i in range(0, 8, 2)]
    common = next(a for a in points[:2] if a in points[2:])
    answer = [sum(point[axis] for point in points) - 3 * common[axis] for axis in range(2)]
    def format_coordinate(value):
        sign = '-' if value < 0 else ''
        value = abs(value)
        return f'{sign}{value // 1000}.{value % 1000:03d}'
    out.append(f'{format_coordinate(answer[0])} {format_coordinate(answer[1])}')
sys.stdout.write('\n'.join(out))
