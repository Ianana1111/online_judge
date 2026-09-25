import sys
data = list(map(int, sys.stdin.buffer.read().split()))
i = 0
out = []
while i + 1 < len(data):
    n, containers = data[i], data[i + 1]
    i += 2
    vessels = data[i:i + n]
    i += n
    low, high = max(vessels), sum(vessels)
    def feasible(capacity):
        used, current = 1, 0
        for milk in vessels:
            if current + milk > capacity:
                used += 1
                current = 0
            current += milk
        return used <= containers
    while low < high:
        middle = (low + high) // 2
        if feasible(middle):
            high = middle
        else:
            low = middle + 1
    out.append(str(low))
sys.stdout.write('\n'.join(out))
