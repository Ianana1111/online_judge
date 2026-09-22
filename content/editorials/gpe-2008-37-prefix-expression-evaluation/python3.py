import sys
import re

def calculate(op, a, b):
    if op == '+': return a + b
    if op == '-': return a - b
    if op == '*': return a * b
    if b == 0: raise ValueError('division by zero')
    quotient = abs(a) // abs(b) * (-1 if (a < 0) != (b < 0) else 1)
    return quotient if op == '/' else a - quotient * b

def evaluate(line):
    stack = []
    try:
        for token in reversed(line.split()):
            if re.fullmatch(r'[0-9]+', token) and int(token) > 0:
                stack.append(int(token))
            elif token in ('+', '-', '*', '/', '%'):
                if len(stack) < 2:
                    raise ValueError('missing operand')
                left = stack.pop()
                right = stack.pop()
                stack.append(calculate(token, left, right))
            else:
                raise ValueError('invalid token')
        if len(stack) != 1:
            raise ValueError('incomplete expression')
        return str(stack[0])
    except ValueError:
        return 'illegal'

for line in sys.stdin:
    line = line.rstrip('\r\n')
    if line == '.':
        break
    print(evaluate(line))
