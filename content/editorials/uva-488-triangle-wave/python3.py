import sys
values=iter(map(int,sys.stdin.buffer.read().split()))
waves=[]
for _ in range(next(values)):
    amplitude,frequency=next(values),next(values)
    rows=[str(h)*h for h in range(1,amplitude+1)]
    rows += [str(h)*h for h in range(amplitude-1,0,-1)]
    waves.extend(['\n'.join(rows)]*frequency)
sys.stdout.write('\n\n'.join(waves)+'\n' if waves else '')
