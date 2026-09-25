#include <stdio.h>
#define NEG -1000000
static int edges[101][101],count[101],degree[101],distance[101],queue[101];
int main(void){
 int n,tc=0;
 while(scanf("%d",&n)==1&&n){
  int start;scanf("%d",&start);
  for(int i=1;i<=n;i++){count[i]=degree[i]=0;distance[i]=NEG;}
  int a,b;
  while(scanf("%d %d",&a,&b)==2&&(a||b)){edges[a][count[a]++]=b;degree[b]++;}
  int front=0,back=0;for(int i=1;i<=n;i++)if(degree[i]==0)queue[back++]=i;
  distance[start]=0;
  while(front<back){int u=queue[front++];
   for(int j=0;j<count[u];j++){
    int v=edges[u][j];if(distance[u]+1>distance[v])distance[v]=distance[u]+1;
    if(--degree[v]==0)queue[back++]=v;
   }
  }
  int finish=start;
  for(int i=1;i<=n;i++)if(distance[i]>distance[finish]||(distance[i]==distance[finish]&&i<finish))finish=i;
  printf("Case %d: The longest path from %d has length %d, finishing at %d.\n\n",++tc,start,distance[finish],finish);
 }
 return 0;
}
