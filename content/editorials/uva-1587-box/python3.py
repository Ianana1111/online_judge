import sys

values = list(map(int, sys.stdin.buffer.read().split()))
for index in range(0, len(values), 12):
    faces = []
    for j in range(index, index + 12, 2):
        a, b = values[j:j + 2]
        faces.append((min(a, b), max(a, b)))
    faces.sort()
    pairs = faces[0] == faces[1] and faces[2] == faces[3] and faces[4] == faces[5]
    edges = (faces[0][0] == faces[2][0] and faces[0][1] == faces[4][0]
             and faces[2][1] == faces[4][1])
    print('POSSIBLE' if pairs and edges else 'IMPOSSIBLE')
