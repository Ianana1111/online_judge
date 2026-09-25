import sys

divisor_sum = [0] * 1001
for divisor in range(1, 1001):
    for multiple in range(divisor, 1001, divisor):
        divisor_sum[multiple] += divisor
largest = [-1] * 1001
for n in range(1, 1001):
    if divisor_sum[n] <= 1000:
        largest[divisor_sum[n]] = n
case_number = 0
for token in sys.stdin.buffer.read().split():
    target = int(token)
    if target == 0:
        break
    case_number += 1
    print(f"Case {case_number}: {largest[target]}")
