import sys
from collections import deque
from array import array

def tokens():
    pending = b''
    while True:
        chunk = sys.stdin.buffer.read(65536)
        if not chunk:
            if pending:
                yield pending
            return
        words = (pending+chunk).split()
        pending = words.pop() if chunk[-1] > 32 else b''
        yield from words

def solve(grid, text):
    rows, columns = len(grid), len(grid[0])
    board = b''.join(grid)
    moves = [[] for _ in board]
    for r in range(rows):
        for c in range(columns):
            at = r*columns+c
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                rr, cc = r+dr, c+dc
                while (0 <= rr < rows and 0 <= cc < columns
                       and board[rr*columns+cc] == board[at]):
                    rr, cc = rr+dr, cc+dc
                if 0 <= rr < rows and 0 <= cc < columns:
                    moves[at].append(rr*columns+cc)
    # Equivalent cells have the same key and the same possible next classes.
    # Quotienting this graph preserves every achievable movement/selection path.
    groups = list(board)
    while True:
        ids = {}
        following = []
        for cell, key in enumerate(board):
            signature = (groups[cell], tuple(sorted({groups[to] for to in moves[cell]})))
            following.append(ids.setdefault(signature, len(ids)))
        old_count = len(set(groups))
        groups = following
        if len(ids) == old_count:
            break
    representatives = [-1]*len(ids)
    for cell, group in enumerate(groups):
        if representatives[group] < 0:
            representatives[group] = cell
    moves = [tuple(sorted({groups[to] for to in moves[cell]})) for cell in representatives]
    board = bytes(board[cell] for cell in representatives)
    # A selection never changes the cursor. Select a needed letter as soon as
    # it is reached, and select its entire consecutive run before moving again.
    text += b'*'
    runs = bytes(ch for i, ch in enumerate(text) if i == 0 or ch != text[i-1])
    size = len(board)
    positions = {}
    for cell, ch in enumerate(board):
        positions.setdefault(ch, []).append(cell)
    infinity = 65535
    distances = []
    for source in range(size):
        distance = array('H', [infinity])*size
        distance[source] = 0
        queue = deque([source])
        while queue:
            cell = queue.popleft()
            following = distance[cell]+1
            for to in moves[cell]:
                if distance[to] == infinity:
                    distance[to] = following
                    queue.append(to)
        distances.append(distance)
    previous_positions = [0]
    costs = [0]
    for ch in runs:
        following_positions = positions[ch]
        following_costs = [None]*len(following_positions)
        for source, cost in zip(previous_positions, costs):
            if cost is None:
                continue
            row = distances[source]
            for i, to in enumerate(following_positions):
                distance = row[to]
                if distance == infinity:
                    continue
                candidate = cost+distance
                if following_costs[i] is None or candidate < following_costs[i]:
                    following_costs[i] = candidate
        previous_positions, costs = following_positions, following_costs
    possible = [cost for cost in costs if cost is not None]
    return min(possible)+len(text) if possible else -1

values = tokens()
answers = []
for value in values:
    rows, columns = int(value), int(next(values))
    grid = [next(values) for _ in range(rows)]
    answers.append(str(solve(grid, next(values))))
print('\n'.join(answers))
