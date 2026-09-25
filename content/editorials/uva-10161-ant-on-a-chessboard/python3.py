import sys
out = []
for token in sys.stdin.buffer.read().split():
    n = int(token)
    if n == 0:
        break
    low, high = 1, 44722
    while low < high:
        middle = (low + high) // 2
        if middle * middle >= n:
            high = middle
        else:
            low = middle + 1
    side = low
    distance = side * side - n
    if distance < side:
        x, y = side, distance + 1
    else:
        x, y = 2 * side - 1 - distance, side
    if side % 2:
        x, y = y, x
    out.append(f'{x} {y}')
sys.stdout.write('\n'.join(out))
