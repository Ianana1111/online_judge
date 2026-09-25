import sys

values = list(map(int, sys.stdin.buffer.read().split()))
for index in range(0, len(values), 2):
    a, b = values[index:index + 2]
    if a == 0 and b == 0:
        break
    carry = operations = 0
    while a or b:
        total = a % 10 + b % 10 + carry
        carry = int(total >= 10)
        operations += carry
        a //= 10
        b //= 10
    if operations == 0:
        print('No carry operation.')
    elif operations == 1:
        print('1 carry operation.')
    else:
        print(f"{operations} carry operations.")
