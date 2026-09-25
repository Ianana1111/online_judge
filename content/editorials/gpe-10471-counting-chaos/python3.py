import sys
from bisect import bisect_right
valid=[time for time in range(1440) if (digits:=str((time//60)*100+time%60))==digits[::-1]]
tokens=iter(sys.stdin.buffer.read().split())
for _ in range(int(next(tokens))):
    hours,minutes=map(int,next(tokens).split(b':'))
    now=hours*60+minutes
    position=bisect_right(valid,now)
    answer=valid[position] if position<len(valid) else valid[0]
    print(f'{answer//60:02d}:{answer%60:02d}')
