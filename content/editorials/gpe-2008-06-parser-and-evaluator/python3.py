import sys
import re

PRIORITY = {'+': 1, '-': 1, '*': 2, '/': 2, '%': 3, 'u+': 4, 'u-': 4}

def evaluate(line):
    values, operators = [], []
    expecting = True
    def apply():
        op = operators.pop()
        if op in ('u+', 'u-'):
            if not values: raise ValueError('missing unary operand')
            if op == 'u-': values[-1] = -values[-1]
            return
        if op == '(' or len(values) < 2:
            raise ValueError('missing binary operand')
        b, a = values.pop(), values.pop()
        if op == '+': result = a + b
        elif op == '-': result = a - b
        elif op == '*': result = a * b
        else:
            if b == 0: raise ValueError('division by zero')
            quotient = abs(a) // abs(b) * (-1 if (a < 0) != (b < 0) else 1)
            result = quotient if op == '/' else a - quotient * b
        values.append(result)
    try:
        tokens = re.findall(r'[0-9]+|[()+*/%\-]|\S', line)
        for token in tokens:
            if re.fullmatch(r'[0-9]+', token):
                if not expecting: raise ValueError('adjacent operands')
                values.append(int(token))
                expecting = False
            elif token == '(':
                if not expecting: raise ValueError('implicit multiplication')
                operators.append(token)
            elif token == ')':
                if expecting: raise ValueError('empty or incomplete group')
                while operators and operators[-1] != '(':
                    apply()
                if not operators: raise ValueError('unmatched close')
                operators.pop()
                expecting = False
            elif token in ('+', '-', '*', '/', '%'):
                if expecting:
                    if token not in ('+', '-'): raise ValueError('missing operand')
                    operators.append('u' + token)
                else:
                    while operators and operators[-1] != '(' and PRIORITY[operators[-1]] >= PRIORITY[token]:
                        apply()
                    operators.append(token)
                    expecting = True
            else:
                raise ValueError('unknown token')
        if expecting: raise ValueError('unfinished expression')
        while operators:
            apply()
        if len(values) != 1: raise ValueError('extra operands')
        return str(values[0])
    except ValueError:
        return 'syntactically incorrect'

for case, line in enumerate(sys.stdin, 1):
    print(f'case {case}:')
    print(evaluate(line.rstrip('\r\n')))
    print()
