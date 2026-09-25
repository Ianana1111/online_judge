import sys

answers = []
for line in sys.stdin.buffer:
    values = list(map(int, line.split()))
    if not values:
        continue
    if values == [0]:
        break
    number = 1
    for index in range(0, len(values), 2):
        number *= values[index] ** values[index + 1]
    rest = number - 1
    factors = []
    divisor = 2
    while divisor * divisor <= rest:
        exponent = 0
        while rest % divisor == 0:
            rest //= divisor
            exponent += 1
        if exponent:
            factors.append((divisor, exponent))
        divisor += 1
    if rest > 1:
        factors.append((rest, 1))
    answers.append(" ".join(f"{p} {e}" for p, e in reversed(factors)))
sys.stdout.write("\n".join(answers) + ("\n" if answers else ""))
