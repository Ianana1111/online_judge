import collections
import sys
nodes={'':[None,None,None]};valid=True;out=[]
for token in sys.stdin.buffer.read().split():
    if token==b'()':
        pending=collections.deque(['']);answer=[]
        while pending:
            path=pending.popleft();value,left,right=nodes[path]
            if value is None:valid=False
            answer.append(value)
            if left is not None:pending.append(left)
            if right is not None:pending.append(right)
        out.append(' '.join(answer) if valid else 'not complete')
        nodes={'':[None,None,None]};valid=True;continue
    value,path=token[1:-1].split(b',');path=path.decode();value=value.lstrip(b'0').decode()
    at=''
    for step in path:
        child=at+step
        if child not in nodes:nodes[child]=[None,None,None]
        nodes[at][step=='R' and 2 or 1]=child
        at=child
    if nodes[at][0] is not None:valid=False
    nodes[at][0]=value
sys.stdout.write('\n'.join(out)+'\n' if out else '')
