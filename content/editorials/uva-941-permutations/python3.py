import math
import sys
data=sys.stdin.buffer.read().split();out=[]
for tc in range(int(data[0])) if data else []:
    word=data[2*tc+1];rank=int(data[2*tc+2]);count=[0]*26
    for ch in word:count[ch-97]+=1
    answer=[]
    for remaining in range(len(word),0,-1):
        for ch in range(26):
            if count[ch]==0:continue
            count[ch]-=1;ways=math.factorial(remaining-1)
            for frequency in count:ways//=math.factorial(frequency)
            if rank<ways:answer.append(chr(ch+97));break
            rank-=ways;count[ch]+=1
    out.append(''.join(answer))
sys.stdout.write('\n'.join(out))
