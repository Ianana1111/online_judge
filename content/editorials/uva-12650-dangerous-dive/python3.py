import sys

values = list(map(int, sys.stdin.buffer.read().split()))
index = 0
answers = []
while index < len(values):
    n, returned = values[index], values[index + 1]
    index += 2
    present = [False] * (n + 1)
    for _ in range(returned):
        present[values[index]] = True
        index += 1
    missing = [str(id) for id in range(1, n + 1) if not present[id]]
    answers.append(' '.join(missing) + ' ' if missing else '*')
sys.stdout.write('\n'.join(answers) + ('\n' if answers else ''))
