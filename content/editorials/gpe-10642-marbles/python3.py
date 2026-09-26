import sys
MOD = 1000000007
values = iter(map(int, sys.stdin.buffer.read().split()))
queries = [(next(values), next(values), next(values)) for _ in range(next(values))]
factorial = [1] * 100001
inverse = [1] * 100001
for i in range(1, 100001):
    factorial[i] = factorial[i-1] * i % MOD
inverse[-1] = pow(factorial[-1], MOD-2, MOD)
for i in range(100000, 0, -1):
    inverse[i-1] = inverse[i] * i % MOD

def choose(n, k):
    return factorial[n] * inverse[k] % MOD * inverse[n-k] % MOD

answers = [0] * len(queries)
groups = {}
for index, (n, k, minimum) in enumerate(queries):
    if n < k*minimum:
        continue
    if k == 1:
        answers[index] = 1
    elif minimum == 1:
        answers[index] = sum((-1 if j % 2 else 1) * choose(k, j) * pow(k-j, n, MOD)
                             for j in range(k+1)) % MOD
    else:
        groups.setdefault((k, minimum), []).append(index)
for (k, minimum), indices in groups.items():
    largest = max(queries[index][0] for index in indices)
    binomial = [0] * (largest+1)
    for balls in range(minimum, largest+1):
        binomial[balls] = choose(balls-1, minimum-1)
    previous = [0] * (largest+1)
    previous[0] = 1
    for count in range(1, k+1):
        current = [0] * (largest+1)
        last = largest-(k-count)*minimum
        for balls in range(count*minimum, last+1):
            exact = binomial[balls] * previous[balls-minimum] % MOD
            current[balls] = count * (current[balls-1]+exact) % MOD
        previous = current
    for index in indices:
        answers[index] = previous[queries[index][0]]
print('\n'.join(f'Case {i+1}: {answer}' for i, answer in enumerate(answers)))
