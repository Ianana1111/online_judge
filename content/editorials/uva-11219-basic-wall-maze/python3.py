import sys
tokens=sys.stdin.buffer.read().split()
if tokens:
    count=int(tokens[0]);out=[]
    for case in range(count):
        cd,cm,cy=map(int,tokens[1+2*case].split(b'/'))
        bd,bm,by=map(int,tokens[2+2*case].split(b'/'))
        if (by,bm,bd)>(cy,cm,cd):answer='Invalid birth date'
        else:
            age=cy-by-((cm,cd)<(bm,bd))
            answer='Check birth date' if age>130 else str(age)
        out.append(f'Case #{case+1}: {answer}')
    sys.stdout.write('\n'.join(out)+'\n')
