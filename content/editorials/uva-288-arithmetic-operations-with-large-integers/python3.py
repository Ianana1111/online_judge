import re
import sys

def calculate(expression):
    tokens = re.findall(r'\d+|\*\*|[+*\-]', expression)
    values = [int(token) for token in tokens[::2]]
    operators = tokens[1::2]
    while '**' in operators:
        i = max(j for j, op in enumerate(operators) if op == '**')
        values[i:i + 2] = [pow(values[i], values[i + 1])]
        operators.pop(i)
    while '*' in operators:
        i = operators.index('*')
        values[i:i + 2] = [values[i] * values[i + 1]]
        operators.pop(i)
    result = values[0]
    for operator, value in zip(operators, values[1:]):
        if operator == '+':
            result += value
        else:
            result -= value
    return result

for line in sys.stdin:
    expression = line.strip()
    if expression:
        print(calculate(expression))
