import sys

def rank(records):
    teams = {}
    for line in records:
        team, problem, minute, verdict = line.split()
        team, problem, minute = int(team), int(problem), int(minute)
        if team not in teams:
            teams[team] = [0, 0, [0] * 10, [False] * 10]
        entry = teams[team]
        if entry[3][problem]:
            continue
        if verdict == 'I':
            entry[2][problem] += 1
        elif verdict == 'C':
            entry[3][problem] = True
            entry[0] += 1
            entry[1] += minute + 20 * entry[2][problem]
    order = sorted(teams, key=lambda team: (-teams[team][0], teams[team][1], team))
    return '\n'.join(f'{team} {teams[team][0]} {teams[team][1]}' for team in order)

def main():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    count = int(lines[0])
    cursor = 1
    results = []
    for _ in range(count):
        while cursor < len(lines) and not lines[cursor].strip():
            cursor += 1
        records = []
        while cursor < len(lines) and lines[cursor].strip():
            records.append(lines[cursor])
            cursor += 1
        results.append(rank(records))
    sys.stdout.write('\n\n'.join(results) + '\n')

if __name__ == '__main__':
    main()
