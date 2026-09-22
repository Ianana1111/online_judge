import sys

def fixed_ratio(numerator, denominator, places):
    if denominator < 0:
        numerator, denominator = -numerator, -denominator
    scale = 10 ** places
    value = (2 * abs(numerator) * scale + denominator) // (2 * denominator)
    sign = '-' if numerator < 0 and value else ''
    return f'{sign}{value // scale}.{value % scale:0{places}d}'


tokens = iter(map(int, sys.stdin.buffer.read().split()))
region = 0
for rows in tokens:
    columns = next(tokens)
    if rows == columns == 0:
        break
    heights = sorted(next(tokens) for _ in range(rows * columns))
    remaining = next(tokens)
    count = 1
    level = heights[0]
    while count < len(heights):
        volume = (heights[count] - level) * count * 100
        if volume > remaining:
            break
        remaining -= volume
        level = heights[count]
        count += 1
    denominator = count * 100
    numerator = level * denominator + remaining
    submerged = sum(height * denominator < numerator for height in heights)
    region += 1
    print(f'Region {region}')
    print('Water level is', fixed_ratio(numerator, denominator, 2), 'meters.')
    print(fixed_ratio(100 * submerged, len(heights), 2), 'percent of the region is under water.')
    print()
