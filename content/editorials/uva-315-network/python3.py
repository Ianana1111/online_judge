import sys
lines=sys.stdin.buffer.read().splitlines();at=0;out=[]
while at<len(lines):
    if not lines[at].strip():at+=1;continue
    n=int(lines[at]);at+=1
    if n==0:break
    linked=[set() for _ in range(n)]
    while at<len(lines):
        row=list(map(int,lines[at].split()));at+=1
        if not row or row[0]==0:break
        u=row[0]-1
        for raw in row[1:]:v=raw-1;linked[u].add(v);linked[v].add(u)
    entered=[0]*n;low=[0]*n;critical=[False]*n;timer=0
    def dfs(u,parent):
        global timer
        timer+=1;entered[u]=low[u]=timer;children=0
        for v in linked[u]:
            if entered[v]==0:
                children+=1;dfs(v,u);low[u]=min(low[u],low[v])
                if parent!=-1 and low[v]>=entered[u]:critical[u]=True
            elif v!=parent:low[u]=min(low[u],entered[v])
        if parent==-1 and children>1:critical[u]=True
    dfs(0,-1);out.append(str(sum(critical)))
sys.stdout.write('\n'.join(out)+'\n' if out else '')
