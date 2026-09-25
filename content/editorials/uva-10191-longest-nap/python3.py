import sys
lines=iter(sys.stdin.buffer.read().splitlines());out=[]
for line in lines:
    if not line.strip():continue
    n=int(line)
    times=[]
    for _ in range(n):
        start,end=next(lines).split(maxsplit=2)[:2]
        sh,sm=map(int,start.split(b':'));eh,em=map(int,end.split(b':'))
        times.append((sh*60+sm,eh*60+em))
    times.append((1080,1080));times.sort()
    cursor=best_start=600;longest=0
    for start,end in times:
        if start-cursor>longest:longest=start-cursor;best_start=cursor
        cursor=max(cursor,end)
    duration=(f'{longest//60} hours and ' if longest>=60 else '')+f'{longest%60} minutes.'
    out.append(f'Day #{len(out)+1}: the longest nap starts at {best_start//60:02d}:{best_start%60:02d} and will last for {duration}')
sys.stdout.write('\n'.join(out))
