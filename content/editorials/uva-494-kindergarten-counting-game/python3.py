import sys

for line in sys.stdin.buffer:
    inside = False
    words = 0
    for ch in line:
        letter = ord('a') <= ch <= ord('z') or ord('A') <= ch <= ord('Z')
        if letter and not inside:
            words += 1
        inside = letter
    print(words)
