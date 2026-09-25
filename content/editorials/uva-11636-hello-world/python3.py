import sys


case_number = 0
for token in sys.stdin.buffer.read().split():
    target = int(token)
    if target <= 0:
        break
    capacity = 1
    pastes = 0
    while capacity < target:
        capacity *= 2
        pastes += 1
    case_number += 1
    print(f"Case {case_number}: {pastes}")
