#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define INF 100000000
static int old[100][100],proposal[100][100];
static void read_graph(int n,int graph[100][100]){
 char line[4096];
 for(int u=0;u<n;u++)for(int v=0;v<n;v++)graph[u][v]=u==v?0:INF;
 for(int row=0;row<n;row++){
  do{if(!fgets(line,sizeof(line),stdin))return;}while(line[0]=='\n'||line[0]=='\r');
  char *at=line;int u=(int)strtol(at,&at,10)-1;
  while(1){char *before=at;int v=(int)strtol(at,&at,10)-1;if(at==before)break;graph[u][v]=1;}
 }
 for(int k=0;k<n;k++)for(int u=0;u<n;u++)for(int v=0;v<n;v++){
  int route=graph[u][k]+graph[k][v];if(route<graph[u][v])graph[u][v]=route;
 }
}
int main(void){
 int n;char line[4096];
 while(scanf("%d",&n)==1&&n){fgets(line,sizeof(line),stdin);
  read_graph(n,old);read_graph(n,proposal);int a,b;scanf("%d %d",&a,&b);
  int valid=1,diameter=0;
  for(int u=0;u<n;u++)for(int v=0;v<n;v++){
   if(old[u][v]>diameter)diameter=old[u][v];
   if(proposal[u][v]==INF||proposal[u][v]>a*old[u][v]+b)valid=0;
  }
  printf("%s %d\n",valid?"Yes":"No",diameter);
 }
 return 0;
}
