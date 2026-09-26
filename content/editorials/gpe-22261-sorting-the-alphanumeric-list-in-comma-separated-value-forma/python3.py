import sys
lines = iter(sys.stdin.read().splitlines())
tests = int(next(lines))
answers = []
for _ in range(tests):
    records = []
    for line in lines:
        if not line:
            if records:
                break
            continue
        records.append(line)
    records.sort(key=lambda row: tuple(field.strip(' ') for field in row.split(',')))
    answers.append('\n'.join(records))
print('\n\n'.join(answers))
