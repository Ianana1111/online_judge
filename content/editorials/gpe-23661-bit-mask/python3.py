import sys
data = list(map(int, sys.stdin.buffer.read().split()))
out = []
for i in range(0, len(data) - 2, 3):
    n, lower, upper = data[i:i + 3]
    mask = 0
    for shift in range(31, -1, -1):
        bit = 1 << shift
        if not n & bit:
            if (mask | bit) <= upper:
                mask |= bit
        elif (mask | (bit - 1)) < lower:
            mask |= bit
    out.append(str(mask))
sys.stdout.write('\n'.join(out))
