import sys
first=True
for token in sys.stdin.buffer.read().split():
    n=int(token)
    if n==0:
        break
    if not first:
        print()
    first=False
    found=False
    for denominator in range(1234,98765//n+1):
        numerator=denominator*n
        digits=f'{numerator:05d}{denominator:05d}'
        if len(set(digits))!=10:
            continue
        found=True
        print(f'{numerator:05d} / {denominator:05d} = {n}')
    if not found:
        print(f'There are no solutions for {n}.')
