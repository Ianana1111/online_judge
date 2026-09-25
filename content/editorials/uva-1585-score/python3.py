import sys

tokens = sys.stdin.buffer.read().split()
if tokens:
    for answer in tokens[1:1 + int(tokens[0])]:
        streak = 0
        total = 0
        for ch in answer:
            if ch == ord('O'):
                streak += 1
                total += streak
            else:
                streak = 0
        print(total)
