import sys

for token in sys.stdin.buffer.read().split():
    years = int(token)
    if years < 0:
        break
    male, female = 0, 1
    for _ in range(years):
        male, female = male + female, male + 1
    print(male, male + female)
