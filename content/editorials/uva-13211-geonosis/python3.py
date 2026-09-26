import sys

def integers():
    pending = b''
    while True:
        chunk = sys.stdin.buffer.read(65536)
        if not chunk:
            if pending:
                yield int(pending)
            return
        words = (pending+chunk).split()
        pending = words.pop() if chunk[-1] > 32 else b''
        for word in words:
            yield int(word)

def unchanged_metric_charge(distance, order):
    n = len(distance)
    if n == 1:
        return 0
    base_twice = distance[0][1]+distance[1][0]
    potential_twice = [distance[0][j]-distance[j][0] for j in range(n)]
    for i, row in enumerate(distance):
        for j, weight in enumerate(row):
            if i != j and 2*weight != base_twice+potential_twice[j]-potential_twice[i]:
                return None
    # This form satisfies every triangle inequality, so no path beats a direct edge.
    deleted = [0] * n
    for step, vertex in enumerate(order):
        deleted[vertex] = step
    return sum(weight*(min(deleted[i], deleted[j])+1)
               for i, row in enumerate(distance) for j, weight in enumerate(row))

def solve(distance, order):
    certified = unchanged_metric_charge(distance, order)
    if certified is not None:
        return certified
    n = len(distance)
    active = []
    answer = 0
    for k in reversed(order):
        active.append(k)
        via_row = distance[k]
        for row in distance:
            via = row[k]
            if via == 0:
                continue
            row[:] = [old if old <= via+other else via+other for old, other in zip(row, via_row)]
        answer += sum(distance[u][v] for u in active for v in active)
    return answer

values = integers()
answers = []
for _ in range(next(values)):
    n = next(values)
    distance = [[next(values) for _ in range(n)] for _ in range(n)]
    order = [next(values) for _ in range(n)]
    answers.append(str(solve(distance, order)))
print('\n'.join(answers))
