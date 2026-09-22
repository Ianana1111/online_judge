import sys

def solve(capacity, target, jars):
    best = None
    best_error, best_volume = 0, 1
    for start in range(len(jars)):
        volume = heat = 0
        for end in range(start, len(jars)):
            amount, temperature = jars[end]
            volume += amount
            heat += amount * temperature
            if volume > capacity:
                break
            if volume == 0 or 2 * volume < capacity:
                continue
            error = abs(heat - target * volume)
            if error > 5 * volume:
                continue
            if best is None or error * best_volume < best_error * volume:
                best = (start, end)
                best_error, best_volume = error, volume
                if error == 0:
                    return best
    return best

tokens = iter(map(int, sys.stdin.buffer.read().split()))
answers = []
for _ in range(next(tokens)):
    capacity, target, count = next(tokens), next(tokens), next(tokens)
    jars = [(next(tokens), next(tokens)) for _ in range(count)]
    result = solve(capacity, target, jars)
    answers.append('Not possible' if result is None else f'{result[0]} {result[1]}')
print('\n'.join(answers))
