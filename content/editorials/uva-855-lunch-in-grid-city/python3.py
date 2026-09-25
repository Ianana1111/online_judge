import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    index = 1
    for _ in range(values[0]):
        streets, avenues, friends = values[index:index + 3]
        index += 3
        street_positions = []
        avenue_positions = []
        for _ in range(friends):
            street_positions.append(values[index])
            avenue_positions.append(values[index + 1])
            index += 2
        street_positions.sort()
        avenue_positions.sort()
        middle = (friends - 1) // 2
        print(f"(Street: {street_positions[middle]}, Avenue: {avenue_positions[middle]})")
