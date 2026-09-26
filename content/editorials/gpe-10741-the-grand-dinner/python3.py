import sys

values = iter(int(word) for line in sys.stdin.buffer for word in line.split())
while True:
    teams, tables = next(values, 0), next(values, 0)
    if teams == tables == 0:
        break
    members = [next(values) for _ in range(teams)]
    seats = [[next(values), table + 1] for table in range(tables)]
    answers = [None] * teams
    for team in sorted(range(teams), key=lambda i: (-members[i], i)):
        seats.sort(key=lambda table: (-table[0], table[1]))
        needed = members[team]
        if needed > tables or seats[needed - 1][0] == 0:
            print(0)
            break
        answers[team] = [seats[j][1] for j in range(needed)]
        for j in range(needed):
            seats[j][0] -= 1
    else:
        print(1)
        for row in answers:
            print(*row)
