import sys
for token in sys.stdin.buffer.read().split():
    original=int(token)
    if original==0:
        break
    print(f'Original number was {original}')
    seen={original}
    current=original
    length=0
    while True:
        digits=''.join(sorted(str(current)))
        low=int(digits)
        high=int(digits[::-1])
        nxt=high-low
        length+=1
        print(f'{high} - {low} = {nxt}')
        if nxt in seen:
            break
        seen.add(nxt)
        current=nxt
    print(f'Chain length {length}\n')
