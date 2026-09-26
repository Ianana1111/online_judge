#include <stdio.h>
#include <string.h>
#include <limits.h>
long long capacity[100][100];
int n,sink,level[100],next_edge[100];
int bfs(int source){
    int queue[100],head=0,tail=0;for(int i=0;i<n;i++)level[i]=-1;
    queue[tail++]=source;level[source]=0;
    while(head<tail){int u=queue[head++];for(int v=0;v<n;v++)if(capacity[u][v]>0&&level[v]<0){level[v]=level[u]+1;queue[tail++]=v;}}
    return level[sink]>=0;
}
long long send(int u,long long available){
    if(u==sink)return available;
    for(int *at=&next_edge[u];*at<n;(*at)++){
        int v=*at;if(capacity[u][v]<=0||level[v]!=level[u]+1)continue;
        long long pushed=send(v,available<capacity[u][v]?available:capacity[u][v]);
        if(pushed){capacity[u][v]-=pushed;capacity[v][u]+=pushed;return pushed;}
    }
    return 0;
}
int main(void){
    int test=0;
    while(scanf("%d",&n)==1&&n){
        int source,edges;scanf("%d%d%d",&source,&sink,&edges);source--;sink--;
        memset(capacity,0,sizeof(capacity));
        for(int i=0;i<edges;i++){int a,b;long long value;scanf("%d%d%lld",&a,&b,&value);a--;b--;capacity[a][b]+=value;capacity[b][a]+=value;}
        long long total=0;
        while(bfs(source)){
            memset(next_edge,0,sizeof(next_edge));long long pushed;
            while((pushed=send(source,LLONG_MAX/4))>0)total+=pushed;
        }
        printf("Network %d\nThe bandwidth is %lld.\n\n",++test,total);
    }
    return 0;
}
