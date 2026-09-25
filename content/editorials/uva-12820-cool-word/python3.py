import sys
tokens=iter(sys.stdin.buffer.read().split())
for case_number,n in enumerate(tokens,1):
    answer=0
    for _ in range(int(n)):
        count=[0]*26
        for ch in next(tokens):
            count[ch-97]+=1
        frequencies=[value for value in count if value]
        if len(frequencies)>=2 and len(frequencies)==len(set(frequencies)):
            answer+=1
    print(f'Case {case_number}: {answer}')
