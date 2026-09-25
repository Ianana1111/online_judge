import sys
solutions = []
board = [0] * 8
def generate(col, rows, rising, falling):
    if col == 8:
        solutions.append(board.copy())
        return
    for row in range(1, 9):
        r = 1 << (row - 1)
        up = 1 << (row - 1 + col)
        down = 1 << (row - 1 - col + 7)
        if rows & r or rising & up or falling & down:
            continue
        board[col] = row
        generate(col + 1, rows | r, rising | up, falling | down)
generate(0, 0, 0, 0)
data = list(map(int, sys.stdin.buffer.read().split()))
out = []
for case_no, start in enumerate(range(0, len(data), 8), 1):
    initial = data[start:start + 8]
    best = min(sum(a != b for a, b in zip(initial, target)) for target in solutions)
    out.append(f'Case {case_no}: {best}')
sys.stdout.write('\n'.join(out))
