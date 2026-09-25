import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    answers = []
    for target in values[1:1 + values[0]]:
        target = abs(target)
        n = 0
        total = 0
        while n == 0 or total < target or (total - target) % 2 != 0:
            n += 1
            total += n
        answers.append(str(n))
    sys.stdout.write('\n\n'.join(answers) + '\n')
