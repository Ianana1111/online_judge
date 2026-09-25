import sys
MOD=1000000007
out=[]
for signature in sys.stdin.buffer.read().split():
    previous=[1]
    for relation in signature:
        prefix=[0]
        for count in previous:prefix.append((prefix[-1]+count)%MOD)
        total=prefix[-1]
        if relation==73:current=prefix
        elif relation==68:current=[(total-value)%MOD for value in prefix]
        else:current=[total]*(len(previous)+1)
        previous=current
    out.append(str(sum(previous)%MOD))
sys.stdout.write('\n'.join(out))
