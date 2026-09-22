import sys

def fixed_ratio(numerator, denominator, places):
    if denominator < 0:
        numerator, denominator = -numerator, -denominator
    scale = 10 ** places
    value = (2 * abs(numerator) * scale + denominator) // (2 * denominator)
    sign = '-' if numerator < 0 and value else ''
    return f'{sign}{value // scale}.{value % scale:0{places}d}'

for line in sys.stdin:
    if not line.strip():
        continue
    k, n = map(int, line.split())
    counts = [1] * (k + 1)
    for length in range(2, n + 1):
        next_counts = [0] * (k + 1)
        for last, count in enumerate(counts):
            for digit in range(max(0, last - 1), min(k, last + 1) + 1):
                next_counts[digit] += count
        counts = next_counts
    print(fixed_ratio(100 * sum(counts), (k + 1) ** n, 5))
