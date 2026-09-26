import sys

def counts(base):
    modulus = 1000000007
    dp = [[0] * base for _ in range(4)]
    for digit in range(1, base):
        dp[2 if digit == base - 1 else 0][digit] = 1
    answer = [0] * 101
    for length in range(1, 101):
        answer[length] = (answer[length-1] + sum(dp[3])) % modulus
        following = [[0] * base for _ in range(4)]
        for mask in range(4):
            for last in range(base):
                for digit in (last - 1, last + 1):
                    if not 0 <= digit < base:
                        continue
                    seen = mask | (1 if digit == 0 else 0) | (2 if digit == base - 1 else 0)
                    following[seen][digit] = (following[seen][digit] + dp[mask][last]) % modulus
        dp = following
    return answer

tokens = iter(map(int, sys.stdin.buffer.read().split()))
answers = []
cache = {}
for _ in range(next(tokens)):
    base, length = next(tokens), next(tokens)
    if base not in cache:
        cache[base] = counts(base)
    answers.append(str(cache[base][length]))
print('\n'.join(answers))
