import sys

def solve(grid):
    n = len(grid)
    size = n * n
    letters = []
    upper = []
    neighbors = [[] for _ in range(size)]
    for r in range(n):
        for c in range(n):
            ch = grid[r][c]
            is_upper = 65 <= ch <= 74
            upper.append(int(is_upper))
            letters.append(ch - (65 if is_upper else 97))
            at = r * n + c
            if r > 0:
                neighbors[at].append(at - n)
            if r + 1 < n:
                neighbors[at].append(at + n)
            if c > 0:
                neighbors[at].append(at - 1)
            if c + 1 < n:
                neighbors[at].append(at + 1)
    answer = size + 1
    queue = [0] * size
    distance = [0] * size
    seen = [-1] * size
    for mask in range(1024):
        if ((mask >> letters[0]) & 1) != upper[0]:
            continue
        if ((mask >> letters[-1]) & 1) != upper[-1]:
            continue
        allowed = [((mask >> letter) & 1) == case for letter, case in zip(letters, upper)]
        front, back = 0, 1
        queue[0] = 0
        distance[0] = 1
        seen[0] = mask
        while front < back:
            at = queue[front]
            front += 1
            if at == size - 1:
                answer = min(answer, distance[at])
                break
            for nxt in neighbors[at]:
                if seen[nxt] == mask or not allowed[nxt]:
                    continue
                seen[nxt] = mask
                distance[nxt] = distance[at] + 1
                queue[back] = nxt
                back += 1
        if answer == 2 * n - 1:
            break
    return -1 if answer == size + 1 else answer

tokens = iter(sys.stdin.buffer.read().split())
answers = []
for value in tokens:
    n = int(value)
    answers.append(str(solve([next(tokens) for _ in range(n)])))
print('\n'.join(answers))
