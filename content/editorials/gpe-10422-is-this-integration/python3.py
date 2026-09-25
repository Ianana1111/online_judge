import math
import sys

for token in sys.stdin.buffer.read().split():
    side = float(token)
    square = side * side
    striped = square * (1 - math.sqrt(3) + math.pi / 3)
    dotted = square * (2 * math.sqrt(3) - 4 + math.pi / 3)
    rest = square * (4 - math.sqrt(3) - 2 * math.pi / 3)
    print(f"{striped:.3f} {dotted:.3f} {rest:.3f}")
