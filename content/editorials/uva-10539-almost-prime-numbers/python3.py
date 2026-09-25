import bisect
import sys
bound=1000000;limit=999999999999
composite=bytearray(bound+1)
for p in range(2,1001):
    if not composite[p]:
        composite[p*p::p]=b'\x01'*((bound-p*p)//p+1)
powers=[]
for p in range(2,bound+1):
    if not composite[p]:
        value=p*p
        while value<=limit:
            powers.append(value)
            if value>limit//p:break
            value*=p
powers.sort()
data=list(map(int,sys.stdin.buffer.read().split()))
out=[]
for tc in range(data[0]) if data else []:
    low,high=data[2*tc+1:2*tc+3]
    out.append(str(bisect.bisect_right(powers,high)-bisect.bisect_left(powers,low)))
sys.stdout.write('\n'.join(out))
