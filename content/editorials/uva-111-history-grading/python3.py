import sys
n = 0
correct = None
out = []
for line in sys.stdin.buffer.read().splitlines():
    ranking = list(map(int, line.split()))
    if not ranking:
        continue
    if len(ranking) == 1:
        n = ranking[0]
        correct = None
        continue
    if correct is None:
        correct = ranking
        continue
    sequence = [0] * n
    for event in range(n):
        sequence[ranking[event] - 1] = correct[event]
    dp = [1] * n
    for i in range(n):
        for j in range(i):
            if sequence[j] < sequence[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    out.append(str(max(dp)))
sys.stdout.write('\n'.join(out))
