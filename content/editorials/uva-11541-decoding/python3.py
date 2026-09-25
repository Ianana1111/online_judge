import sys
tokens=iter(sys.stdin.buffer.read().split())
for case_number in range(1,int(next(tokens))+1):
    encoded=next(tokens)
    parts=[]
    i=0
    while i<len(encoded):
        letter=encoded[i:i+1]
        i+=1
        count=0
        while i<len(encoded) and 48<=encoded[i]<=57:
            count=count*10+encoded[i]-48
            i+=1
        parts.append(letter*count)
    sys.stdout.buffer.write(f'Case {case_number}: '.encode()+b''.join(parts)+b'\n')
