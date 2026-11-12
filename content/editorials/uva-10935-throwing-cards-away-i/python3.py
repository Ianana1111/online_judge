import sys
from collections import deque

out = []
for token in sys.stdin.buffer.read().split():
    n = int(token)
    if n == 0:
        break
    deck = deque(range(1, n + 1))
    thrown = []
    while len(deck) >= 2:
        thrown.append(deck.popleft())
        deck.append(deck.popleft())
    out.append("Discarded cards:" + (" " + ", ".join(map(str, thrown)) if thrown else ""))
    out.append("Remaining card: " + str(deck[0]))
sys.stdout.write("\n".join(out) + ("\n" if out else ""))
