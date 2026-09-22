import sys

def main():
    data = iter(map(int, sys.stdin.read().split()))
    answers = []
    for width in data:
        height = next(data)
        if width == height == 0:
            break
        count = next(data)
        blocked = {(next(data), next(data)) for _ in range(count)}
        ways = [0] * (width + 1)
        ways[0] = 1
        for y in range(height + 1):
            for x in range(width + 1):
                if (x, y) in blocked:
                    ways[x] = 0
                elif x > 0:
                    ways[x] += ways[x - 1]
        result = ways[width]
        if result == 0:
            answers.append('There is no path.')
        elif result == 1:
            answers.append("There is one path from Little Red Riding Hood's house to her grandmother's house.")
        else:
            answers.append(f"There are {result} paths from Little Red Riding Hood's house to her grandmother's house.")
    print('\n'.join(answers))

if __name__ == '__main__':
    main()
