import sys
tokens=iter(sys.stdin.buffer.read().split())
for _ in range(int(next(tokens))):
    n,token,chosen=int(next(tokens)),next(tokens),int(next(tokens))
    positive=any(49<=ch<=57 for ch in token.split(b'e')[0].split(b'E')[0])
    result=0.0
    if positive:
        p=float(token)
        q=1-p
        weight=1.0
        total=target=0.0
        for player in range(1,n+1):
            total+=weight
            if player==chosen:
                target=weight
            weight*=q
        result=target/total
    print(f'{result:.4f}')
