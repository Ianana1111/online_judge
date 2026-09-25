import sys

def integers():
    data = sys.stdin.buffer.read()
    value = 0
    sign = 1
    active = False
    for ch in data:
        if ch == 45:
            sign = -1
            active = True
        elif 48 <= ch <= 57:
            value = value * 10 + ch - 48
            active = True
        elif active:
            yield sign * value
            value = 0
            sign = 1
            active = False
    if active:
        yield sign * value

values = integers()
for _ in range(next(values)):
    n = next(values)
    colors = bytearray(1000000)
    largest = 0
    for _ in range(n):
        floor = next(values)
        size = abs(floor)
        colors[size] = 1 if floor > 0 else 2
        if size > largest:
            largest = size
    previous = 0
    answer = 0
    for color in colors[:largest + 1]:
        if color and color != previous:
            answer += 1
            previous = color
    print(answer)
