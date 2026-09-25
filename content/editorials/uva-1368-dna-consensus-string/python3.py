import sys
tokens=iter(sys.stdin.buffer.read().split())
alphabet=b'ACGT'
for _ in range(int(next(tokens))):
    m,n=int(next(tokens)),int(next(tokens))
    dna=[next(tokens) for _ in range(m)]
    answer=bytearray()
    errors=0
    for col in range(n):
        count=[sum(row[col]==base for row in dna) for base in alphabet]
        best=max(range(4),key=lambda i:count[i])
        answer.append(alphabet[best])
        errors+=m-count[best]
    sys.stdout.buffer.write(answer+b'\n'+str(errors).encode()+b'\n')
