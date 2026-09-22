import sys

data = list(map(int, sys.stdin.buffer.read().split()))
position = 0
answers = []
while position < len(data):
    n = data[position]
    roots = data[position + 1:position + 1 + n]
    position += n + 1
    coefficients = [1]
    for root in roots:
        updated = [0] * (len(coefficients) + 1)
        for degree, coefficient in enumerate(coefficients):
            updated[degree] -= root * coefficient
            updated[degree + 1] += coefficient
        coefficients = updated
    terms = []
    for degree in range(n, -1, -1):
        coefficient = coefficients[degree]
        if coefficient == 0 and degree > 0:
            continue
        magnitude = abs(coefficient)
        if degree == 0:
            term = str(magnitude)
        else:
            variable = "x" if degree == 1 else f"x^{degree}"
            term = ("" if magnitude == 1 else str(magnitude)) + variable
        if terms:
            terms.append((" + " if coefficient >= 0 else " - ") + term)
        else:
            terms.append(term)
    answers.append("".join(terms) + " = 0")
sys.stdout.write("\n".join(answers) + ("\n" if answers else ""))
