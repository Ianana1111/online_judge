import sys
from collections import deque

def solve(outlets, devices, adapters):
    graph = {}
    for a, b in adapters:
        graph.setdefault(a, []).append(b)
    compatible = []
    for plug in devices:
        reached = {plug}
        queue = deque([plug])
        while queue:
            for following in graph.get(queue.popleft(), ()):
                if following not in reached:
                    reached.add(following)
                    queue.append(following)
        compatible.append([i for i, outlet in enumerate(outlets) if outlet in reached])
    owner = [-1] * len(outlets)

    def augment(device, seen):
        for outlet in compatible[device]:
            if seen[outlet]:
                continue
            seen[outlet] = True
            if owner[outlet] < 0 or augment(owner[outlet], seen):
                owner[outlet] = device
                return True
        return False

    connected = sum(augment(i, [False] * len(outlets)) for i in range(len(devices)))
    return len(devices) - connected

tokens = iter(sys.stdin.buffer.read().split())
answers = []
for _ in range(int(next(tokens))):
    outlets = [next(tokens) for _ in range(int(next(tokens)))]
    devices = []
    for _ in range(int(next(tokens))):
        next(tokens)  # Device name does not affect compatibility.
        devices.append(next(tokens))
    adapters = [(next(tokens), next(tokens)) for _ in range(int(next(tokens)))]
    answers.append(str(solve(outlets, devices, adapters)))
print('\n\n'.join(answers))
