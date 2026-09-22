import sys

def main():
    queries = list(map(int, sys.stdin.buffer.read().split()))
    if not queries:
        return
    moves = [0] * (max(queries) + 1)
    for disks in range(1, len(moves)):
        best = 2 * moves[disks - 1] + 1
        bottom = 2
        three_pegs = 3
        while bottom <= disks and three_pegs < best:
            candidate = 2 * moves[disks - bottom] + three_pegs
            if candidate < best:
                best = candidate
            bottom += 1
            three_pegs = 2 * three_pegs + 1
        moves[disks] = best
    sys.stdout.write('\n'.join(str(moves[n]) for n in queries) + '\n')

if __name__ == '__main__':
    main()
