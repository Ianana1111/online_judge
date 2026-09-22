import sys
lines = sys.stdin.read().splitlines()
answers = []
for i in range(0, len(lines), 2):
    a = set(map(int, lines[i].split()))
    b = set(map(int, lines[i + 1].split()))
    if a == b:
        answer = 'A equals B'
    elif a < b:
        answer = 'A is a proper subset of B'
    elif b < a:
        answer = 'B is a proper subset of A'
    elif a.isdisjoint(b):
        answer = 'A and B are disjoint'
    else:
        answer = "I'm confused!"
    answers.append(answer)
print('\n'.join(answers))
