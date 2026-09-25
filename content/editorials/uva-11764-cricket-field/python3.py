import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    index = 1
    for case_number in range(1, values[0] + 1):
        n = values[index]
        previous = values[index + 1]
        index += 2
        high = low = 0
        for _ in range(1, n):
            current = values[index]
            index += 1
            if current > previous:
                high += 1
            elif current < previous:
                low += 1
            previous = current
        print(f"Case {case_number}: {high} {low}")
