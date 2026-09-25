import sys
data = list(map(int, sys.stdin.buffer.read().split()))
i = 0
out = []
while i < len(data):
    n = data[i]; i += 1
    if n == 0:
        break
    while i < len(data) and data[i] != 0:
        target = data[i:i + n]
        i += n
        station = []
        arriving = 1
        possible = True
        for wanted in target:
            while arriving <= n and (not station or station[-1] != wanted):
                station.append(arriving)
                arriving += 1
            if not station or station[-1] != wanted:
                possible = False
                break
            station.pop()
        out.append('Yes' if possible else 'No')
    i += 1
    out.append('')
sys.stdout.write('\n'.join(out) + ('\n' if out else ''))
