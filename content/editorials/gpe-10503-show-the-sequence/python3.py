import sys

def evaluate(expression, count):
    frames = []
    at = 0
    while True:
        at += 1  # opening bracket
        begin = at
        if expression[at] == '-':
            at += 1
        while expression[at].isdigit():
            at += 1
        value = int(expression[begin:at])
        if expression[at] == ']':
            result = [value] * count
            break
        frames.append((value, expression[at]))
        at += 1
    for value, operator in reversed(frames):
        if operator == '+':
            current = value
            output = [current]
            for item in result[:-1]:
                current += item
                output.append(current)
        else:
            current = value
            output = []
            for item in result:
                current *= item
                output.append(current)
        result = output
    return result

for line in sys.stdin:
    if line.strip():
        expression, count = line.split()
        print(' '.join(map(str, evaluate(expression, int(count)))))
