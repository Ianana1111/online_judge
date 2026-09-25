import sys
tokens=iter(sys.stdin.buffer.read().split());out=[]
def add(tree,at,delta):
    while at<len(tree):tree[at]+=delta;at+=at&-at
def prefix(tree,at):
    result=0
    while at:result+=tree[at];at-=at&-at
    return result
for first in tokens:
    n=int(first);k=int(next(tokens));value=[0]*(n+1)
    zeros=[0]*(n+1);negatives=[0]*(n+1)
    for i in range(1,n+1):
        value[i]=int(next(tokens))
        if value[i]==0:add(zeros,i,1)
        if value[i]<0:add(negatives,i,1)
    answer=[]
    for _ in range(k):
        op=next(tokens);left=int(next(tokens));right=int(next(tokens))
        if op==b'C':
            add(zeros,left,(right==0)-(value[left]==0))
            add(negatives,left,(right<0)-(value[left]<0));value[left]=right
        elif prefix(zeros,right)-prefix(zeros,left-1):answer.append('0')
        elif (prefix(negatives,right)-prefix(negatives,left-1))%2:answer.append('-')
        else:answer.append('+')
    out.append(''.join(answer))
sys.stdout.write('\n'.join(out))
