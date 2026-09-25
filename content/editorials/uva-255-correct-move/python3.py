import sys
def can_reach(start, end, king):
    if start == end or end == king:
        return False
    if start // 8 == end // 8:
        return not (king // 8 == start // 8 and min(start, end) < king < max(start, end))
    if start % 8 == end % 8:
        return not (king % 8 == start % 8 and min(start, end) < king < max(start, end))
    return False
data = list(map(int, sys.stdin.buffer.read().split()))
out = []
for i in range(0, len(data) - 2, 3):
    king, queen, destination = data[i:i + 3]
    if king == queen:
        out.append('Illegal state')
    elif not can_reach(queen, destination, king):
        out.append('Illegal move')
    else:
        kr, kc = divmod(king, 8)
        qr, qc = divmod(destination, 8)
        if abs(kr - qr) + abs(kc - qc) == 1:
            out.append('Move not allowed')
            continue
        escape = False
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            r, c = kr + dr, kc + dc
            if 0 <= r < 8 and 0 <= c < 8:
                next_square = r * 8 + c
                if next_square != destination and not can_reach(destination, next_square, king):
                    escape = True
        out.append('Continue' if escape else 'Stop')
sys.stdout.write('\n'.join(out))
