import sys
tokens=iter(sys.stdin.buffer.read().split())
outputs=[]
for _ in range(int(next(tokens))):
    makers=[]
    for _ in range(int(next(tokens))):
        makers.append((next(tokens),int(next(tokens)),int(next(tokens))))
    answers=[]
    for _ in range(int(next(tokens))):
        price=int(next(tokens))
        matches=[name for name,low,high in makers if low<=price<=high]
        answers.append((matches[0] if len(matches)==1 else b'UNDETERMINED').decode())
    outputs.append('\n'.join(answers))
print('\n\n'.join(outputs))
