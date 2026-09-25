import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=1;out=[]
for _ in range(data[0]) if data else []:
    n=data[at];at+=1;sticks=data[at:at+n];at+=n;total=sum(sticks)
    if total%4 or max(sticks)>total//4:out.append('no');continue
    side=total//4;sticks.sort(reverse=True);full=(1<<n)-1;failed=set()
    def search(mask,filled):
        if mask==full:return True
        if mask in failed:return False
        previous=-1
        for i,value in enumerate(sticks):
            bit=1<<i
            if mask&bit or value==previous or filled+value>side:continue
            if search(mask|bit,(filled+value)%side):return True
            previous=value
            if filled==0:break
        failed.add(mask)
        return False
    out.append('yes' if search(0,0) else 'no')
sys.stdout.write('\n'.join(out)+'\n' if out else '')
