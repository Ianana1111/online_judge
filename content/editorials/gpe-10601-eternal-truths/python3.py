from array import array
import sys

def words():
    for line in sys.stdin.buffer:
        yield from line.split()

values = iter(words())
for _ in range(int(next(values))):
    rows, columns = int(next(values)), int(next(values))
    board = b''.join(next(values) for _ in range(rows))
    start = board.index(b'S')
    distance = array('i', [-1]) * (3 * len(board))
    queue = array('i', [3 * start])
    distance[3 * start] = 0
    head = 0
    answer = -1
    while head < len(queue):
        state = queue[head]
        head += 1
        node, phase = divmod(state, 3)
        if board[node] == ord('E'):
            answer = distance[state]
            break
        row, column = divmod(node, columns)
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            r, c = row, column
            for step in range(phase + 1):
                r, c = r + dr, c + dc
                if not (0 <= r < rows and 0 <= c < columns) or board[r * columns + c] == ord('#'):
                    break
            else:
                following = 3 * (r * columns + c) + (phase + 1) % 3
                if distance[following] < 0:
                    distance[following] = distance[state] + 1
                    queue.append(following)
    print('NO' if answer < 0 else answer)
