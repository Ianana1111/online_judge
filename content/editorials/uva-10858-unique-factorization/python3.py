import sys
out = []
for token in sys.stdin.buffer.read().split():
    n = int(token)
    if n == 0:
        break
    answers = []
    path = []
    def search(rest, minimum):
        divisor = minimum
        while divisor * divisor <= rest:
            if rest % divisor == 0:
                path.append(divisor)
                search(rest // divisor, divisor)
                path.pop()
            divisor += 1
        if path and rest >= minimum:
            answers.append(path + [rest])
    search(n, 2)
    answers.sort()
    out.append(str(len(answers)))
    out.extend(' '.join(map(str, factors)) for factors in answers)
sys.stdout.write('\n'.join(out))
