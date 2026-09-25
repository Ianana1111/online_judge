import sys

lines = iter(sys.stdin.read().splitlines())
answers = []
case = 0
for header in lines:
    count = int(header)
    if count == 0:
        break
    screen = [[" "] * 10 for _ in range(10)]
    row = col = 0
    insert = False
    for _ in range(count):
        line = next(lines)
        at = 0
        while at < len(line):
            char = line[at]
            at += 1
            if char == "^":
                command = line[at]
                at += 1
                if command.isdigit():
                    row = int(command)
                    col = int(line[at])
                    at += 1
                    continue
                if command == "b":
                    col = 0
                elif command == "c":
                    screen = [[" "] * 10 for _ in range(10)]
                elif command == "d":
                    row = min(9, row + 1)
                elif command == "e":
                    screen[row][col:] = [" "] * (10 - col)
                elif command == "h":
                    row = col = 0
                elif command == "i":
                    insert = True
                elif command == "l":
                    col = max(0, col - 1)
                elif command == "o":
                    insert = False
                elif command == "r":
                    col = min(9, col + 1)
                elif command == "u":
                    row = max(0, row - 1)
                if command != "^":
                    continue
                char = "^"
            if insert:
                for c in range(9, col, -1):
                    screen[row][c] = screen[row][c - 1]
            screen[row][col] = char
            col = min(9, col + 1)
    case += 1
    answers.append(f"Case {case}\n+----------+")
    answers.extend("|" + "".join(line) + "|" for line in screen)
    answers.append("+----------+")
sys.stdout.write("\n".join(answers) + ("\n" if answers else ""))
