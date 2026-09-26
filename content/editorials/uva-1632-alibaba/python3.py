import sys
from bisect import bisect_left, bisect_right

def earliest(a, b):
    if a < 0:
        return b
    if b < 0:
        return a
    return min(a, b)

def arrive(time, distance, deadline):
    if time < 0:
        return -1
    following = time + distance
    return following if following < deadline else -1

def solve(position, deadline):
    n = len(position)
    if any(time <= 0 for time in deadline):
        return -1
    # A feasible start must reach every coin before its own deadline.
    low = max(x-time+1 for x, time in zip(position, deadline))
    high = min(x+time-1 for x, time in zip(position, deadline))
    first = bisect_left(position, low)
    last = bisect_right(position, high)-1
    if first > last:
        return -1
    span = position[-1]-position[0]
    bound = span + min(position[first]-position[0], position[-1]-position[last])
    # A feasible end-to-end sweep meeting the lower bound is already optimal.
    start = position[first]
    if span+start-position[0] == bound:
        if all((start-x if i <= first else start-position[0]+x-position[0]) < deadline[i]
               for i, x in enumerate(position)):
            return bound
    start = position[last]
    if span+position[-1]-start == bound:
        if all((x-start if i >= last else position[-1]-start+position[-1]-x) < deadline[i]
               for i, x in enumerate(position)):
            return bound
    prefix = [float('inf')] * (n+1)
    suffix = [float('inf')] * (n+1)
    for i in range(n):
        prefix[i+1] = min(prefix[i], deadline[i]+position[i])
    for i in range(n-1, -1, -1):
        suffix[i] = min(suffix[i+1], deadline[i]-position[i])
    # Keep only intervals whose endpoint can still reach every remaining coin.
    states = {i: (0, 0) for i in range(first, last+1)}
    for length in range(1, n):
        following = {}
        for l, (left_time, right_time) in states.items():
            r = l+length-1
            if l > 0:
                time = earliest(arrive(left_time, position[l]-position[l-1], deadline[l-1]),
                                arrive(right_time, position[r]-position[l-1], deadline[l-1]))
                if (time >= 0 and time < prefix[l-1]-position[l-1]
                        and time < suffix[r+1]+position[l-1]):
                    old = following.get(l-1, (-1, -1))
                    following[l-1] = (earliest(old[0], time), old[1])
            if r+1 < n:
                time = earliest(arrive(left_time, position[r+1]-position[l], deadline[r+1]),
                                arrive(right_time, position[r+1]-position[r], deadline[r+1]))
                if (time >= 0 and time < prefix[l]-position[r+1]
                        and time < suffix[r+2]+position[r+1]):
                    old = following.get(l, (-1, -1))
                    following[l] = (old[0], earliest(old[1], time))
        if not following:
            return -1
        states = following
    return earliest(*states[0])

values = iter(map(int, sys.stdin.buffer.read().split()))
answers = []
for n in values:
    position, deadline = [], []
    for _ in range(n):
        position.append(next(values))
        deadline.append(next(values))
    result = solve(position, deadline)
    answers.append('No solution' if result < 0 else str(result))
print('\n'.join(answers))
