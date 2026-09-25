import sys

for token in sys.stdin.buffer.read().split():
    hour, minute = map(int, token.split(b':'))
    if hour == 0 and minute == 0:
        break
    twice_angle = abs(60 * (hour % 12) + minute - 12 * minute)
    twice_angle = min(twice_angle, 720 - twice_angle)
    print(f"{twice_angle / 2:.3f}")
