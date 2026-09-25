import sys


values = list(map(int, sys.stdin.buffer.read().split()))
index = 0
answers = []
while index < len(values):
    queries = values[index]
    index += 1
    if queries == 0:
        break
    center_x, center_y = values[index:index + 2]
    index += 2
    for _ in range(queries):
        x, y = values[index:index + 2]
        index += 2
        if x == center_x or y == center_y:
            answers.append("divisa")
        else:
            answers.append(("N" if y > center_y else "S") + ("E" if x > center_x else "O"))
sys.stdout.write("\n".join(answers))
