import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=0;tc=0;out=[]
while at<len(data) and data[at]:
    n=data[at];at+=1;blocks=[]
    for _ in range(n):
        d=data[at:at+3];at+=3
        for h in range(3):
            x,y=sorted((d[(h+1)%3],d[(h+2)%3]))
            blocks.append((x,y,d[h]))
    blocks.sort();best=[0]*len(blocks);answer=0
    for i,(x,y,height) in enumerate(blocks):
        best[i]=height
        for j,(other_x,other_y,_) in enumerate(blocks[:i]):
            if other_x<x and other_y<y:
                best[i]=max(best[i],height+best[j])
        answer=max(answer,best[i])
    tc+=1;out.append(f'Case {tc}: maximum height = {answer}')
sys.stdout.write('\n'.join(out)+'\n' if out else '')
