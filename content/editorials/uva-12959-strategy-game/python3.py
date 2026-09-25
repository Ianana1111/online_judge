import sys

values = list(map(int, sys.stdin.buffer.read().split()))
index = 0
while index < len(values):
    players, rounds = values[index:index + 2]
    index += 2
    if players == 0 and rounds == 0:
        break
    total = [0] * players
    for _ in range(rounds):
        for player in range(players):
            total[player] += values[index]
            index += 1
    winner = 0
    for player in range(1, players):
        if total[player] >= total[winner]:
            winner = player
    print(winner + 1)
