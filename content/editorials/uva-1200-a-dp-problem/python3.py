import sys

def parse(text):
    coefficient = constant = 0
    i = 0
    while i < len(text):
        sign = 1
        if text[i] in '+-':
            if text[i] == '-':
                sign = -1
            i += 1
        value = 0
        has_digits = False
        while i < len(text) and '0' <= text[i] <= '9':
            has_digits = True
            value = value * 10 + int(text[i])
            i += 1
        if i < len(text) and text[i] == 'x':
            coefficient += sign * (value if has_digits else 1)
            i += 1
        else:
            constant += sign * value
    return coefficient, constant

tokens = iter(sys.stdin.read().split())
answers = []
for _ in range(int(next(tokens))):
    left, right = next(tokens).split('=')
    a, b = parse(left)
    c, d = parse(right)
    numerator, denominator = d - b, a - c
    if denominator == 0:
        answers.append('IDENTITY' if numerator == 0 else 'IMPOSSIBLE')
    else:
        answers.append(str(numerator // denominator))
print('\n'.join(answers))
