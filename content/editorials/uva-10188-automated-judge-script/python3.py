import sys
lines=[line[:-1] if line.endswith(b'\r') else line for line in sys.stdin.buffer.read().split(b'\n')];at=0;out=[]
spaces=b' \t\n\r\v\f'
while at<len(lines):
    if not lines[at]:at+=1;continue
    n=int(lines[at]);at+=1
    if n==0:break
    standard=lines[at:at+n];at+=n
    m=int(lines[at]);at+=1
    team=lines[at:at+m];at+=m
    if standard==team:verdict='Accepted'
    elif b''.join(line.translate(None,spaces) for line in standard)==b''.join(line.translate(None,spaces) for line in team):
        verdict='Presentation Error'
    else:verdict='Wrong Answer'
    out.append(f'Run #{len(out)+1}: {verdict} {sum(map(len,standard))}')
sys.stdout.write('\n'.join(out))
