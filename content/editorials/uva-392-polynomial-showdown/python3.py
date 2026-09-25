import sys
data=list(map(int,sys.stdin.buffer.read().split()))
out=[]
for offset in range(0,len(data),9):
    coefficients=data[offset:offset+9];parts=[]
    for i,value in enumerate(coefficients):
        if value==0:continue
        degree=8-i;magnitude=abs(value)
        body=(str(magnitude) if degree==0 or magnitude!=1 else '')
        if degree>0:body+='x'+(f'^{degree}' if degree>1 else '')
        sign=('-' if value<0 else '') if not parts else (' - ' if value<0 else ' + ')
        parts.append(sign+body)
    out.append(''.join(parts) if parts else '0')
sys.stdout.write('\n'.join(out))
