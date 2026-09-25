import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    answers = []
    for case_number in range(values[0]):
        keys = values[1 + 2 * case_number]
        doors = values[2 + 2 * case_number]
        answers.append(str(keys * (2 * doors - keys - 1) // 2))
    sys.stdout.write('\n'.join(answers) + '\n')
