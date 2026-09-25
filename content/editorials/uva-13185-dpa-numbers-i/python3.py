import sys


values = list(map(int, sys.stdin.buffer.read().split()))
for number in values[1:1 + values[0]]:
    total = 0
    for divisor in range(1, number):
        if number % divisor == 0:
            total += divisor
    if total < number:
        print("deficient")
    elif total == number:
        print("perfect")
    else:
        print("abundant")
