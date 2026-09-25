import sys
tokens=iter(sys.stdin.buffer.read().split())
for case_number in range(int(next(tokens))):
    text=next(tokens)
    n=len(text)
    answer=n
    for period in range(1,n+1):
        if n%period==0 and all(text[i]==text[i%period] for i in range(period,n)):
            answer=period
            break
    if case_number:
        print()
    print(answer)
