import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    for case_number in range(values[0]):
        rounds = values[1 + 2*case_number]
        team = values[2 + 2*case_number]
        if team == 0:
            print(1, 1)
        else:
            best = bin(team).count('1') + 1
            block = team & -team
            worst = (1 << rounds) - block + 1
            print(best, worst)
