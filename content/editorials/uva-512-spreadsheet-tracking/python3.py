import sys
values = iter(sys.stdin.buffer.read().split())
answers = []
case = 0
for token in values:
    rows, columns = int(token), int(next(values))
    if rows == columns == 0:
        break
    position = [[r, c] for r in range(1, rows+1) for c in range(1, columns+1)]
    for _ in range(int(next(values))):
        command = next(values)
        if command == b'EX':
            a = [int(next(values)), int(next(values))]
            b = [int(next(values)), int(next(values))]
            for cell in position:
                if cell == a:
                    cell[:] = b
                elif cell == b:
                    cell[:] = a
        else:
            indices = [int(next(values)) for _ in range(int(next(values)))]
            insert = command[0] == ord('I')
            axis = 0 if command[1] == ord('R') else 1
            for cell in position:
                if cell[0] < 0:
                    continue
                before = cell[axis]
                if not insert and before in indices:
                    cell[:] = [-1, -1]
                else:
                    shift = sum(index <= before if insert else index < before for index in indices)
                    cell[axis] += shift if insert else -shift
    case += 1
    output = [f'Spreadsheet #{case}']
    for _ in range(int(next(values))):
        r, c = int(next(values)), int(next(values))
        now_r, now_c = position[(r-1)*columns+c-1]
        message = f'Cell data in ({r},{c})'
        message += ' GONE' if now_r < 0 else f' moved to ({now_r},{now_c})'
        output.append(message)
    answers.append('\n'.join(output))
print('\n\n'.join(answers))
