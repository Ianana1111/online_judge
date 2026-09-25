import sys
MOD=1000000007
data=list(map(int,sys.stdin.buffer.read().split()))
at=1;out=[]
for tc in range(1,data[0]+1) if data else []:
    count=data[at];at+=1;ordered=number=1
    for _ in range(count):
        prime,exponent=data[at:at+2];at+=2;power=1;lower=0
        for _ in range(exponent):
            lower=(lower+power)%MOD
            power=power*prime%MOD
        factor=(lower+(exponent+1)*power)%MOD
        ordered=ordered*factor%MOD;number=number*power%MOD
    out.append(f'Case {tc}: {(ordered+number)%MOD}')
sys.stdout.write('\n'.join(out))
