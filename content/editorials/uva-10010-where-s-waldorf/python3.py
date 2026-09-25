import sys
data = sys.stdin.buffer.read().split()
if not data:
    sys.exit()
i = 1
groups = []
for _ in range(int(data[0])):
    rows, cols = int(data[i]), int(data[i + 1]); i += 2
    grid = [data[i + r].lower() for r in range(rows)]
    i += rows
    queries = int(data[i]); i += 1
    answers = []
    for _ in range(queries):
        word = data[i].lower(); i += 1
        found = False
        for r in range(rows):
            if found:
                break
            for c in range(cols):
                for dr in (-1, 0, 1):
                    for dc in (-1, 0, 1):
                        if dr == 0 and dc == 0:
                            continue
                        if all(0 <= r + k * dr < rows and 0 <= c + k * dc < cols
                               and grid[r + k * dr][c + k * dc] == letter
                               for k, letter in enumerate(word)):
                            answers.append(f'{r + 1} {c + 1}')
                            found = True
                            break
                    if found:
                        break
                if found:
                    break
            if found:
                break
    groups.append('\n'.join(answers))
sys.stdout.write('\n\n'.join(groups))
