import sys

limit = 300
count = [1] * (limit + 1)
for n in range(1, limit + 1):
    count[n] = count[n - 1] * (4 * n - 2) * n // (n + 1)
answers = []
for token in sys.stdin.buffer.read().split():
    n = int(token)
    if n == 0:
        break
    answers.append(str(count[n]))
sys.stdout.write("\n".join(answers) + ("\n" if answers else ""))
