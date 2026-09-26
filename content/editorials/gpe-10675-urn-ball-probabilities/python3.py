import math
import sys

queries = [int(value) for line in sys.stdin.buffer for value in line.split()]
answers = [None] * len(queries)
step = 0
survival = factorial = survival_error = factorial_error = 0.0
for target, index in sorted((value, i) for i, value in enumerate(queries)):
    while step < target:
        step += 1
        term = math.log1p(-1.0 / (step * (step + 1))) - survival_error
        following = survival + term
        survival_error = (following - survival) - term
        survival = following
        term = math.log10(step) - factorial_error
        following = factorial + term
        factorial_error = (following - factorial) - term
        factorial = following
    probability = -math.expm1(survival) if target else 0.0
    zeros = math.floor(2 * factorial + math.log10(target + 1)) if target else 0
    answers[index] = f'{probability:.6f} {zeros}'
print('\n'.join(answers))
