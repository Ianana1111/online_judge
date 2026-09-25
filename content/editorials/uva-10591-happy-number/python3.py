import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
for case_number in range(1,next(values)+1):
    original=next(values)
    value=original
    seen=set()
    while value!=1 and value not in seen:
        seen.add(value)
        value=sum(int(digit)**2 for digit in str(value))
    result='a Happy' if value==1 else 'an Unhappy'
    print(f'Case #{case_number}: {original} is {result} number.')
