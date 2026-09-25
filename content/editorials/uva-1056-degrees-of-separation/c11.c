#include <stdio.h>
#include <string.h>
#define INF 1000000
static char names[50][32];
static int dist[50][50];
static int index_of(const char *name,int *count){
 for(int i=0;i<*count;i++)if(strcmp(names[i],name)==0)return i;
 strcpy(names[*count],name);return (*count)++;
}
int main(void){
 int n,r,tc=0;
 while(scanf("%d %d",&n,&r)==2&&(n||r)){
  int count=0;
  for(int i=0;i<n;i++)for(int j=0;j<n;j++)dist[i][j]=i==j?0:INF;
  for(int i=0;i<r;i++){
   char a[32],b[32];scanf("%31s %31s",a,b);
   int u=index_of(a,&count),v=index_of(b,&count);
   dist[u][v]=dist[v][u]=1;
  }
  for(int k=0;k<n;k++)for(int i=0;i<n;i++)for(int j=0;j<n;j++)
   if(dist[i][k]+dist[k][j]<dist[i][j])dist[i][j]=dist[i][k]+dist[k][j];
  int answer=0;
  for(int i=0;i<n;i++)for(int j=0;j<n;j++)if(dist[i][j]>answer)answer=dist[i][j];
  printf("Network %d: ",++tc);
  if(answer==INF)puts("DISCONNECTED\n");else printf("%d\n\n",answer);
 }
 return 0;
}
