import math
import sys

values = list(map(int, sys.stdin.buffer.read().split()))
case_number = 0
for index in range(0, len(values), 4):
    v1,d1,v2,d2 = values[index:index+4]
    if v1 == d1 == v2 == d2 == 0:
        break
    case_number += 1
    captain = d1*v2 < d2*v1
    numerator = d1*v2 + d2*v1
    denominator = 2*v1*v2
    divisor = math.gcd(numerator, denominator)
    numerator //= divisor
    denominator //= divisor
    print(f"Case #{case_number}: {'You owe me a beer!' if captain else 'No beer for the captain.'}")
    print(f"Avg. arrival time: {numerator}" + (f"/{denominator}" if denominator != 1 else ''))
