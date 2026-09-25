import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
for n in values:
    m=next(values)
    if n<=1 or m<=1:
        print('Boring!')
        continue
    sequence=[n]
    current=n
    while current>1 and current%m==0:
        current//=m
        sequence.append(current)
    print(' '.join(map(str,sequence)) if current==1 else 'Boring!')
