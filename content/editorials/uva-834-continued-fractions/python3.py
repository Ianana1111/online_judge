import sys
values = list(map(int, sys.stdin.buffer.read().split()))
answers = []
for i in range(0, len(values), 2):
    numerator, denominator = values[i:i + 2]
    if denominator < 0:
        numerator, denominator = -numerator, -denominator
    coefficients = []
    while denominator:
        quotient, remainder = divmod(numerator, denominator)
        coefficients.append(quotient)
        numerator, denominator = denominator, remainder
    answers.append('[' + str(coefficients[0]) + ';' + ','.join(map(str, coefficients[1:])) + ']')
print('\n'.join(answers))
