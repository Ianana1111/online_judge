import math
import sys
data=sys.stdin.buffer.read().split();out=[]
for tc in range(1,int(data[0])+1) if data else []:
    word=data[2*tc-1];rank=int(data[2*tc])-1;n=len(word)
    available=list(range(n));order=bytearray(n)
    for i,ch in enumerate(word):
        block=math.factorial(n-i-1);index,rank=divmod(rank,block)
        order[available.pop(index)]=ch
    out.append(f'Case {tc}: {order.decode()}')
sys.stdout.write('\n'.join(out))
