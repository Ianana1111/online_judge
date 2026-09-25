import sys
events=[]
for line in sys.stdin.buffer:
    if line.strip()==b'.':
        break
    values=line.split()
    if len(values)>=2:
        left,right=map(int,values[:2])
        events.append((left,1))
        events.append((right,-1))
events.sort()
active=answer=0
previous=events[0][0] if events else 0
for position,change in events:
    answer+=(position-previous)*(active*(active-1)//2)
    active+=change
    previous=position
print(answer)
