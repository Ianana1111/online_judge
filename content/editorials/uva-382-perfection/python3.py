import sys
print('PERFECTION OUTPUT')
for token in sys.stdin.buffer.read().split():
    n=int(token)
    if n==0:
        break
    total=0 if n==1 else 1
    divisor=2
    while divisor*divisor<=n:
        if n%divisor==0:
            total+=divisor
            pair=n//divisor
            if pair!=divisor:
                total+=pair
        divisor+=1
    kind='PERFECT' if total==n else 'ABUNDANT' if total>n else 'DEFICIENT'
    print(f'{n:5d}  {kind}')
print('END OF OUTPUT')
