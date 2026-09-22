import sys
values = list(map(int, sys.stdin.buffer.read().split()))
at = 0
answers = []
while at < len(values):
    n, nights = values[at:at + 2]
    at += 2
    distances = values[at:at + n + 1]
    at += n + 1
    low, high = max(distances), sum(distances)
    while low < high:
        limit = (low + high) // 2
        days, walked = 1, 0
        for distance in distances:
            if walked + distance > limit:
                days += 1
                walked = distance
            else:
                walked += distance
        if days <= nights + 1:
            high = limit
        else:
            low = limit + 1
    answers.append(str(low))
print('\n'.join(answers))
