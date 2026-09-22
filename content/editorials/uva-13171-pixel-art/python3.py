import sys

words = iter(sys.stdin.buffer.read().split())
tests = int(next(words))
color_mask = {"M": 1, "Y": 2, "C": 4, "R": 3, "B": 7, "G": 6, "V": 5, "W": 0}
for _ in range(tests):
    remaining = [int(next(words)) for _ in range(3)]
    picture = next(words).decode("ascii")
    for color in picture:
        mask = color_mask[color]
        for channel in range(3):
            if mask & (1 << channel):
                remaining[channel] -= 1
    if min(remaining) < 0:
        print("NO")
    else:
        print("YES", *remaining)
