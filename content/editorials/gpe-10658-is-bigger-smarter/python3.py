import sys
data=list(map(int,sys.stdin.buffer.read().split()))
animals=[(data[i],data[i+1],i//2+1) for i in range(0,len(data)-1,2)]
animals.sort(key=lambda a:(a[0],-a[1],a[2]))
n=len(animals);length=[1]*n;previous=[-1]*n;last=-1
for i in range(n):
    for j in range(i):
        if animals[j][0]<animals[i][0] and animals[j][1]>animals[i][1] and length[j]+1>length[i]:
            length[i]=length[j]+1;previous[i]=j
    if last<0 or length[i]>length[last]:last=i
path=[]
while last>=0:
    path.append(animals[last][2]);last=previous[last]
path.reverse()
sys.stdout.write(str(len(path))+'\n'+'\n'.join(map(str,path)))
