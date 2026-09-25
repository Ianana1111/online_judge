import sys
lines=iter(sys.stdin.buffer.read().splitlines())
tests=int(next(lines))
outputs=[]
for _ in range(tests):
    line=next(lines)
    while not line.strip():
        line=next(lines)
    positions=list(map(int,line.split()))
    words=next(lines).split()
    answer=[b'']*len(positions)
    for position,word in zip(positions,words):
        answer[position-1]=word
    outputs.append(b'\n'.join(answer))
sys.stdout.buffer.write(b'\n\n'.join(outputs)+(b'\n' if outputs else b''))
