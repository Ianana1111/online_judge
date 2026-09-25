import sys

data = list(map(int, sys.stdin.buffer.read().split()))
if data:
    tests = data[0]
    at = 1
    answers = []
    for _ in range(tests):
        n = data[at]
        at += 1
        weights = data[at:at + n]
        at += n
        total = sum(weights)
        team_size = n // 2
        possible = [0] * (team_size + 1)
        possible[0] = 1
        for seen, weight in enumerate(weights, 1):
            for count in range(min(seen, team_size), 0, -1):
                possible[count] |= possible[count - 1] << weight
        best = total + 1
        low = 0
        for weight in range(total + 1):
            if (possible[team_size] >> weight) & 1:
                difference = abs(total - 2 * weight)
                if difference < best:
                    best = difference
                    low = min(weight, total - weight)
        answers.append(f"{low} {total - low}")
    sys.stdout.write("\n\n".join(answers) + "\n")
