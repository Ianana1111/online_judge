import sys

values = list(map(int, sys.stdin.buffer.read().split()))
index = 0
while index < len(values):
    n = values[index]
    index += 1
    if n == 0:
        break
    ending = best = 0
    for value in values[index:index + n]:
        ending = max(0, ending + value)
        best = max(best, ending)
    index += n
    if best > 0:
        print(f"The maximum winning streak is {best}.")
    else:
        print('Losing streak.')
