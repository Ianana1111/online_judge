import sys

def solve(grid):
    row = [0] * 9
    column = [0] * 9
    box = [0] * 9
    empty = []
    for cell, value in enumerate(grid):
        r, c = divmod(cell, 9)
        b = r // 3 * 3 + c // 3
        if value:
            bit = 1 << (value - 1)
            if (row[r] | column[c] | box[b]) & bit:
                return False
            row[r] |= bit
            column[c] |= bit
            box[b] |= bit
        else:
            empty.append(cell)

    def search(at):
        if at == len(empty):
            return True
        minimum = 10
        pick = at
        options = 0
        for i in range(at, len(empty)):
            r, c = divmod(empty[i], 9)
            b = r // 3 * 3 + c // 3
            mask = 511 & ~(row[r] | column[c] | box[b])
            count = bin(mask).count("1")
            if count < minimum:
                minimum, pick, options = count, i, mask
            if minimum == 0:
                return False
        empty[at], empty[pick] = empty[pick], empty[at]
        cell = empty[at]
        r, c = divmod(cell, 9)
        b = r // 3 * 3 + c // 3
        while options:
            bit = options & -options
            options -= bit
            grid[cell] = bit.bit_length()
            row[r] |= bit
            column[c] |= bit
            box[b] |= bit
            if search(at + 1):
                return True
            row[r] &= ~bit
            column[c] &= ~bit
            box[b] &= ~bit
            grid[cell] = 0
        empty[at], empty[pick] = empty[pick], empty[at]
        return False

    return search(0)

values = iter(map(int, sys.stdin.buffer.read().split()))
answers = []
for _ in range(next(values)):
    grid = [next(values) for _ in range(81)]
    if solve(grid):
        answers.extend(' '.join(map(str, grid[r*9:r*9+9])) for r in range(9))
    else:
        answers.append('NO')
print('\n'.join(answers))
