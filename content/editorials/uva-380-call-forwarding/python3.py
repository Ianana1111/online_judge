import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=1;out=['CALL FORWARDING OUTPUT']
for system in range(1,data[0]+1) if data else []:
    requests=[]
    while data[at]:
        source,start,duration,target=data[at:at+4];at+=4
        requests.append((source,start,duration,target))
    at+=1;out.append(f'SYSTEM {system}')
    while data[at]!=9000:
        time,extension=data[at:at+2];at+=2
        current=extension;seen=set()
        while True:
            if current in seen:current=9999;break
            seen.add(current)
            next_target=None
            for source,start,duration,target in requests:
                if source==current and start<=time<=start+duration:
                    next_target=target;break
            if next_target is None:break
            current=next_target
        out.append(f'AT {time:04d} CALL TO {extension:04d} RINGS {current:04d}')
    at+=1
out.append('END OF OUTPUT')
sys.stdout.write('\n'.join(out)+'\n')
