import sys
from fractions import Fraction

COINS = (1, 2, 4, 10, 20, 40)

def solve(stocks, target):
    if target == 0:
        return 0
    paid = count = 0
    for value, stock in reversed(list(zip(COINS, stocks))):
        needed = max(0, (target - paid + value - 1) // value)
        take = min(stock, needed)
        paid += take * value
        count += take
    change = [0] + [10**9] * (paid - target)
    for amount in range(1, len(change)):
        change[amount] = 1 + min(change[amount - v] for v in COINS if v <= amount)
    budget = count + change[paid - target]
    limit = 40 * budget
    infinity = budget + 1
    own = [infinity] * (limit + 1)
    own[0] = 0
    for value, stock in zip(COINS, stocks):
        remaining = min(stock, budget)
        chunk = 1
        while remaining:
            take = min(chunk, remaining)
            worth = value * take
            for amount in range(limit, worth - 1, -1):
                own[amount] = min(own[amount], own[amount - worth] + take)
            remaining -= take
            chunk *= 2
    shop = [0] + [infinity] * (limit - target)
    for amount in range(1, len(shop)):
        shop[amount] = 1 + min(shop[amount - v] for v in COINS if v <= amount)
    return min(own[paid] + shop[paid - target] for paid in range(target, limit + 1))

def main():
    tokens = iter(sys.stdin.read().split())
    answers = []
    for first in tokens:
        stocks = [int(first)] + [int(next(tokens)) for _ in range(5)]
        if not any(stocks):
            break
        target = int(Fraction(next(tokens)) * 20)
        answers.append(f'{solve(stocks, target):3d}')
    sys.stdout.write('\n'.join(answers) + '\n')

if __name__ == '__main__':
    main()
