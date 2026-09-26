import sys
from collections import deque

def valid_net(board):
    start = next(i for i, square in enumerate(board) if square)
    frames = {start: (1, 2, 3)}
    queue = deque([start])
    normals = set()
    consistent = True
    while queue:
        at = queue.popleft()
        r, c = divmod(at, 6)
        u, v, normal = frames[at]
        normals.add(normal)
        turns = ((-normal, v, u), (normal, v, -u),
                 (u, -normal, v), (u, normal, -v))
        for (dr, dc), turned in zip(((0, 1), (0, -1), (1, 0), (-1, 0)), turns):
            rr, cc = r + dr, c + dc
            if not (0 <= rr < 6 and 0 <= cc < 6):
                continue
            nxt = rr * 6 + cc
            if not board[nxt]:
                continue
            if nxt in frames:
                if frames[nxt] != turned:
                    consistent = False
            else:
                frames[nxt] = turned
                queue.append(nxt)
    return consistent and len(frames) == 6 and len(normals) == 6

values = iter(map(int, sys.stdin.buffer.read().split()))
answers = []
for _ in range(next(values)):
    board = [next(values) for _ in range(36)]
    answers.append('correct' if valid_net(board) else 'incorrect')
print('\n\n'.join(answers))
