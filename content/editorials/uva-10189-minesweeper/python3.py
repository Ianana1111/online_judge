import sys
tokens = iter(sys.stdin.buffer.read().split())
fields = []
for token in tokens:
    rows, cols = int(token), int(next(tokens))
    if rows == cols == 0:
        break
    grid = [next(tokens) for _ in range(rows)]
    answer = [f'Field #{len(fields) + 1}:']
    for r in range(rows):
        line = []
        for c in range(cols):
            if grid[r][c] == 42:
                line.append('*')
            else:
                count = sum(0 <= r+dr < rows and 0 <= c+dc < cols and grid[r+dr][c+dc] == 42
                            for dr in (-1, 0, 1) for dc in (-1, 0, 1))
                line.append(str(count))
        answer.append(''.join(line))
    fields.append('\n'.join(answer))
print('\n\n'.join(fields))
