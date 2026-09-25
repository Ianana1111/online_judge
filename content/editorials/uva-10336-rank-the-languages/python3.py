import sys
data = sys.stdin.buffer.read().split()
if not data:
    sys.exit()
i = 1
out = []
for tc in range(1, int(data[0]) + 1):
    rows, cols = int(data[i]), int(data[i + 1])
    i += 2
    grid = [bytearray(data[i + r]) for r in range(rows)]
    i += rows
    count = [0] * 26
    for r in range(rows):
        for c in range(cols):
            language = grid[r][c]
            if language == 46:
                continue
            count[language - 97] += 1
            queue = [(r, c)]
            grid[r][c] = 46
            for y, x in queue:
                for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                    if 0 <= ny < rows and 0 <= nx < cols and grid[ny][nx] == language:
                        grid[ny][nx] = 46
                        queue.append((ny, nx))
    out.append(f'World #{tc}')
    for letter in sorted((letter for letter in range(26) if count[letter]), key=lambda x: (-count[x], x)):
        out.append(f'{chr(97 + letter)}: {count[letter]}')
sys.stdout.write('\n'.join(out))
