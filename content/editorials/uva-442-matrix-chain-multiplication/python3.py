import sys

lines = sys.stdin.buffer.read().decode().splitlines()
n = int(lines[0])
dimensions = {}
for line in lines[1:n + 1]:
    name, rows, cols = line.split()
    dimensions[name] = (int(rows), int(cols))
answers = []
for expression in lines[n + 1:]:
    if not expression.strip():
        continue
    stack = []
    total = 0
    valid = True
    for symbol in expression:
        if symbol == '(':
            continue
        if symbol == ')':
            other_rows, cols = stack.pop()
            rows, shared = stack.pop()
            if shared != other_rows:
                valid = False
            total += rows * shared * cols
            stack.append((rows, cols))
        else:
            stack.append(dimensions[symbol])
    answers.append(str(total) if valid else "error")
sys.stdout.write("\n".join(answers) + ("\n" if answers else ""))
