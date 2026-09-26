#include <stdio.h>
#include <stdlib.h>
int main(void){
    int n,m,test=0;
    while(scanf("%d%d",&n,&m)==2&&(n||m)){
        int *head=malloc(n*sizeof(int)),*to=malloc(2*m*sizeof(int)),*next=malloc(2*m*sizeof(int));
        int *cap=malloc(2*m*sizeof(int)),*parent=malloc(n*sizeof(int)),*queue=malloc(n*sizeof(int));
        for(int i=0;i<n;i++)head[i]=-1;
        for(int i=0;i<m;i++){
            int a,b;scanf("%d%d",&a,&b);a--;b--;int e=2*i;
            to[e]=b;next[e]=head[a];head[a]=e;cap[e]=1;
            to[e+1]=a;next[e+1]=head[b];head[b]=e+1;cap[e+1]=1;
        }
        int source,target,flow=0;scanf("%d%d",&source,&target);source--;target--;
        for(int round=0;round<2;round++){
            for(int i=0;i<n;i++)parent[i]=-1;
            int front=0,back=0;queue[back++]=source;parent[source]=-2;
            while(front<back&&parent[target]<0){
                int u=queue[front++];
                for(int e=head[u];e!=-1;e=next[e])if(cap[e]>0&&parent[to[e]]==-1){parent[to[e]]=e;queue[back++]=to[e];}
            }
            if(parent[target]<0)break;
            for(int v=target;v!=source;){int e=parent[v];cap[e]--;cap[e^1]++;v=to[e^1];}
            flow++;
        }
        printf("Case %d: %s\n",++test,flow==2?"YES":"NO");
        free(head);free(to);free(next);free(cap);free(parent);free(queue);
    }
    return 0;
}
