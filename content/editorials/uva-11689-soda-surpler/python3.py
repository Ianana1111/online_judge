import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    for case_number in range(values[0]):
        owned, found, cost = values[1 + 3 * case_number:4 + 3 * case_number]
        empty = owned + found
        total = 0
        while empty >= cost:
            drinks = empty // cost
            total += drinks
            empty = empty % cost + drinks
        print(total)
