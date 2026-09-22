import re
import sys
if hasattr(sys, 'set_int_max_str_digits'):
    sys.set_int_max_str_digits(0)

def parse(expression):
    values, operators = [], []
    at = 0
    while True:
        match = re.match(r'\s*([+-]?)\s*(\d+)', expression[at:])
        values.append(int(match.group(1) + match.group(2)))
        at += match.end()
        if not expression[at:].strip():
            return values, operators
        match = re.match(r'\s*([+\-*/])', expression[at:])
        operators.append(match.group(1))
        at += match.end()

def render(values, operators, variable):
    text = str(values[0])
    for operator, value in zip(operators, values[1:]):
        text += f' {operator} {value}'
    return text + ' = ' + variable

first = True
for line in sys.stdin:
    if not line.strip():
        continue
    expression, variable = line.split('=')
    variable = variable.strip()
    values, operators = parse(expression)
    if not first:
        print()
    first = False
    print(render(values, operators, variable))
    while operators:
        high = [i for i, op in enumerate(operators) if op in '*/']
        i = high[0] if high else 0
        a, b = values[i:i + 2]
        operator = operators[i]
        if operator == '+':
            result = a + b
        elif operator == '-':
            result = a - b
        elif operator == '*':
            result = a * b
        else:
            result = a // b
        values[i:i + 2] = [result]
        operators.pop(i)
        print(render(values, operators, variable))
