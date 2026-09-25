import sys
data=sys.stdin.buffer.read().split();at=1;out=[]
for _ in range(int(data[0])) if data else []:
    n=int(data[at]);at+=1;cars=[]
    for i in range(n):
        value=data[at].lstrip(b'0') or b'0';at+=1;cars.append((value,i))
    ordered=sorted(cars,key=lambda item:(len(item[0]),item[0]))
    weight=[0]*n
    for rank,(_,index) in enumerate(ordered):weight[index]=rank
    rise=[1]*n;fall=[1]*n;answer=0
    for i in range(n-1,-1,-1):
        for j in range(i+1,n):
            if weight[j]>weight[i]:rise[i]=max(rise[i],rise[j]+1)
            if weight[j]<weight[i]:fall[i]=max(fall[i],fall[j]+1)
        answer=max(answer,rise[i]+fall[i]-1)
    out.append(str(answer))
sys.stdout.write('\n'.join(out)+'\n' if out else '')
