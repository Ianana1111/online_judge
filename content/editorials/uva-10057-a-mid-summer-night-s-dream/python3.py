import sys
from array import array


def numbers():
    value = 0
    reading = False
    while True:
        chunk = sys.stdin.buffer.read(65536)
        if not chunk:
            break
        for ch in chunk:
            if ord('0') <= ch <= ord('9'):
                value = value * 10 + ch - ord('0')
                reading = True
            elif reading:
                yield value
                value = 0
                reading = False
    if reading:
        yield value


tokens = iter(numbers())
for n in tokens:
    frequency = array('I', [0]) * 65536
    for _ in range(n):
        frequency[next(tokens)] += 1

    lower_rank = (n + 1) // 2
    upper_rank = n // 2 + 1
    count = 0
    low = None
    high = 0
    for value, occurrences in enumerate(frequency):
        count += occurrences
        if count >= lower_rank and low is None:
            low = value
        if count >= upper_rank:
            high = value
            break

    optimal_input_count = sum(frequency[low:high + 1])
    print(low, optimal_input_count, high - low + 1)
