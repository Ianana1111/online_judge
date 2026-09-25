import sys

queries = []
for token in sys.stdin.buffer.read().split():
    n = int(token)
    if n < 3:
        break
    queries.append(n)

answers = {}
current = 2
total = 0
for target in sorted(set(queries)):
    for largest in range(current + 1, target + 1):
        total += (largest - 2) ** 2 // 4
    answers[target] = total
    current = target

for n in queries:
    print(answers[n])
