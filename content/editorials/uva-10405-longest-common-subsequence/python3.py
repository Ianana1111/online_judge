import sys
lines = sys.stdin.buffer.read().splitlines()
out = []
for i in range(0, len(lines) - 1, 2):
    a = lines[i].removesuffix(b'\r')
    b = lines[i + 1].removesuffix(b'\r')
    previous = [0] * (len(b) + 1)
    for ch in a:
        current = [0] * (len(b) + 1)
        for j, other in enumerate(b, 1):
            current[j] = previous[j - 1] + 1 if ch == other else max(previous[j], current[j - 1])
        previous = current
    out.append(str(previous[-1]))
sys.stdout.write('\n'.join(out))
