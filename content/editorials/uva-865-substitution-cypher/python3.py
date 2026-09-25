import sys
lines=sys.stdin.buffer.read().splitlines()
if lines:
    tests=int(lines[0]);at=1;out=[]
    for tc in range(tests):
        while at<len(lines) and not lines[at]:at+=1
        plain=lines[at];sub=lines[at+1];at+=2
        if tc:out.append(b'')
        out.extend((sub,plain))
        table=bytes.maketrans(plain,sub)
        while at<len(lines) and lines[at]:
            out.append(lines[at].translate(table));at+=1
    sys.stdout.buffer.write(b'\n'.join(out))
