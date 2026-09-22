import sys

def solve(matrix):
    n = len(matrix)
    edges = [(matrix[a][b], a, b) for a in range(n) for b in range(a + 1, n) if matrix[a][b] > 0]
    edges.sort()
    parent = list(range(n))
    size = [1] * n
    def find(a):
        while a != parent[a]:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a
    chosen = []
    for weight, a, b in edges:
        left, right = find(a), find(b)
        if left == right:
            continue
        if size[left] < size[right]:
            left, right = right, left
        parent[right] = left
        size[left] += size[right]
        chosen.append((weight, a, b))
        if len(chosen) == n - 1:
            break
    return chosen

tokens = iter(sys.stdin.read().replace(',', ' ').split())
tests = int(next(tokens))
for case in range(1, tests + 1):
    n = int(next(tokens))
    matrix = [[int(next(tokens)) for _ in range(n)] for _ in range(n)]
    print(f'Case {case}:')
    for weight, a, b in solve(matrix):
        print(f'{chr(65+a)}-{chr(65+b)} {weight}')
