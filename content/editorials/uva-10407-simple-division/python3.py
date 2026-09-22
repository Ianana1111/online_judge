import sys

def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

for line in sys.stdin:
    values = list(map(int, line.split()))
    if not values:
        continue
    if values == [0]:
        break
    values.pop()  # Remove this sequence's terminating zero.
    first = values[0]
    answer = 0
    for value in values[1:]:
        answer = gcd(answer, abs(value - first))
    print(answer)
