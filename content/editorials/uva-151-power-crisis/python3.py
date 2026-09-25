import sys
out = []
for token in sys.stdin.buffer.read().split():
    n = int(token)
    if n == 0:
        break
    step = 1
    while True:
        survivor = 0
        for size in range(2, n):
            survivor = (survivor + step) % size
        if survivor == 11:
            break
        step += 1
    out.append(str(step))
sys.stdout.write('\n'.join(out))
