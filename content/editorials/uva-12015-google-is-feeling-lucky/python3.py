import sys

tokens = sys.stdin.buffer.read().split()
if tokens:
    index = 1
    lines = []
    for case_number in range(1, int(tokens[0]) + 1):
        sites = []
        best = -1
        for _ in range(10):
            url = tokens[index].decode()
            score = int(tokens[index + 1])
            index += 2
            sites.append((url, score))
            best = max(best, score)
        lines.append(f"Case #{case_number}:")
        for url, score in sites:
            if score == best:
                lines.append(url)
    sys.stdout.write('\n'.join(lines) + '\n')
