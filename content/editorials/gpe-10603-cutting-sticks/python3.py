import sys
data = list(map(int, sys.stdin.buffer.read().split()))
i = 0
out = []
while i < len(data):
    length = data[i]; i += 1
    if length == 0:
        break
    n = data[i]; i += 1
    cuts = [0] + data[i:i + n] + [length]
    i += n
    dp = [[0] * (n + 2) for _ in range(n + 2)]
    for gap in range(2, n + 2):
        for left in range(n + 2 - gap):
            right = left + gap
            dp[left][right] = cuts[right] - cuts[left] + min(
                dp[left][first] + dp[first][right]
                for first in range(left + 1, right)
            )
    out.append(f'The minimum cutting is {dp[0][n + 1]}.')
sys.stdout.write('\n'.join(out))
