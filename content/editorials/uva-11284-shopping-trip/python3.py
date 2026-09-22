import sys
from functools import lru_cache

def cents(token):
    dollars, fraction = token.split('.')
    return int(dollars) * 100 + int(fraction)

def main():
    data = iter(sys.stdin.read().split())
    scenarios = int(next(data))
    answers = []
    for _ in range(scenarios):
        n, m = int(next(data)), int(next(data))
        distance = [[None] * (n + 1) for _ in range(n + 1)]
        for i in range(n + 1):
            distance[i][i] = 0
        for _ in range(m):
            u, v, cost = int(next(data)), int(next(data)), cents(next(data))
            if distance[u][v] is None or cost < distance[u][v]:
                distance[u][v] = distance[v][u] = cost
        for mid in range(n + 1):
            for u in range(n + 1):
                if distance[u][mid] is None:
                    continue
                for v in range(n + 1):
                    if distance[mid][v] is None:
                        continue
                    candidate = distance[u][mid] + distance[mid][v]
                    if distance[u][v] is None or candidate < distance[u][v]:
                        distance[u][v] = candidate
        savings = {}
        for _ in range(int(next(data))):
            store, amount = int(next(data)), cents(next(data))
            savings[store] = savings.get(store, 0) + amount
        stores = [0] + sorted(savings)
        k = len(stores) - 1
        cost = [[distance[u][v] for v in stores] for u in stores]
        @lru_cache(None)
        def best(mask, current):
            answer = -cost[current][0]
            for index in range(k):
                bit = 1 << index
                if not mask & bit:
                    answer = max(answer, savings[stores[index + 1]] - cost[current][index + 1]
                                 + best(mask | bit, index + 1))
            return answer
        amount = best(0, 0)
        best.cache_clear()
        answers.append(f'Daniel can save ${amount // 100}.{amount % 100:02d}'
                       if amount > 0 else "Don't leave the house")
    print('\n'.join(answers))

if __name__ == '__main__':
    main()
