import sys


tokens = sys.stdin.buffer.read().split()
for plate in tokens[1:1 + int(tokens[0])]:
    letters = 0
    for character in plate[:3]:
        letters = letters * 26 + character - ord("A")
    digits = int(plate[4:])
    print("nice" if abs(letters - digits) <= 100 else "not nice")
