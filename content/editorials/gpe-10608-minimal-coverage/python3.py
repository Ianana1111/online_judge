import sys
data=list(map(int,sys.stdin.buffer.read().split()))
if not data:sys.exit()
i=1;groups=[]
for _ in range(data[0]):
    target=data[i];i+=1;segments=[]
    while True:
        left,right=data[i],data[i+1];i+=2
        if left==0 and right==0:break
        segments.append((left,right))
    segments.sort();covered=at=0;answer=[]
    while covered<target:
        farthest=covered;chosen=None
        while at<len(segments) and segments[at][0]<=covered:
            if segments[at][1]>farthest:
                farthest=segments[at][1];chosen=segments[at]
            at+=1
        if chosen is None:
            answer=[];break
        answer.append(chosen);covered=farthest
    groups.append('\n'.join([str(len(answer))]+[f'{a} {b}' for a,b in answer]))
sys.stdout.write('\n\n'.join(groups))
