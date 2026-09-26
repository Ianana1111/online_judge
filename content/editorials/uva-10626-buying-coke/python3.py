import sys


def minimum_coins(cokes, ones, fives, tens):
    # Every useful ten pays for one drink. A converted ten costs three extra coins.
    tens_used = min(cokes, tens)
    remaining = cokes - tens_used
    converted = min(tens_used, max(0, remaining - fives))
    available_fives = fives + converted

    if available_fives <= remaining:
        without_tens = 4 * available_fives + 8 * (remaining - available_fives)
    elif available_fives <= 2 * remaining:
        pairs = available_fives - remaining
        singles = remaining - pairs
        without_tens = 2 * pairs + 4 * singles
    else:
        without_tens = 2 * remaining
    return tens_used + 3 * converted + without_tens


def numbers():
    for line in sys.stdin.buffer:
        yield from map(int, line.split())


values = iter(numbers())
for _ in range(next(values)):
    cokes, ones, fives, tens = (next(values) for _ in range(4))
    print(minimum_coins(cokes, ones, fives, tens))
