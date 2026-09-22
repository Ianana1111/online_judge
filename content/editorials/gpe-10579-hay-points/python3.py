import sys
from fractions import Fraction

def decimal_string(value):
    denominator = value.denominator
    twos = fives = 0
    while denominator % 2 == 0:
        denominator //= 2
        twos += 1
    while denominator % 5 == 0:
        denominator //= 5
        fives += 1
    places = max(twos, fives)
    scale = 10 ** places
    integer = value.numerator * (scale // value.denominator)
    if places == 0:
        return str(integer)
    text = str(integer // scale) + '.' + str(integer % scale).zfill(places)
    return text.rstrip('0').rstrip('.')

tokens = iter(sys.stdin.buffer.read().decode().split())
words, descriptions = int(next(tokens)), int(next(tokens))
values = {}
for _ in range(words):
    word, amount = next(tokens), next(tokens)
    values[word] = Fraction(amount)
for _ in range(descriptions):
    salary = Fraction(0)
    for word in tokens:
        if word == '.':
            break
        salary += values.get(word, 0)
    print(decimal_string(salary))
