import sys

duration = {ord('W'):64, ord('H'):32, ord('Q'):16, ord('E'):8,
            ord('S'):4, ord('T'):2, ord('X'):1}
for song in sys.stdin.buffer.read().split():
    if song == b'*':
        break
    total = 0
    answer = 0
    for note in song:
        if note == ord('/'):
            if total == 64:
                answer += 1
            total = 0
        else:
            total += duration[note]
    print(answer)
