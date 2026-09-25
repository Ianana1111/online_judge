#include <stdio.h>
#include <stdlib.h>
#include <string.h>
static unsigned char linked[100][100],critical[100];static int entered[100],low[100],timer,n;
static void dfs(int u,int parent){
 entered[u]=low[u]=++timer;int children=0;
 for(int v=0;v<n;v++)if(linked[u][v]){
  if(!entered[v]){children++;dfs(v,u);if(low[v]<low[u])low[u]=low[v];
   if(parent!=-1&&low[v]>=entered[u])critical[u]=1;
  }else if(v!=parent&&entered[v]<low[u])low[u]=entered[v];
 }
 if(parent==-1&&children>1)critical[u]=1;
}
int main(void){
 char line[1024];
 while(scanf("%d",&n)==1&&n){
  fgets(line,sizeof(line),stdin);memset(linked,0,sizeof(linked));
  while(fgets(line,sizeof(line),stdin)){
   char *at=line;int u=(int)strtol(at,&at,10);if(u==0)break;u--;
   while(1){char *before=at;int v=(int)strtol(at,&at,10);if(at==before)break;v--;
    linked[u][v]=linked[v][u]=1;
   }
  }
  memset(entered,0,sizeof(entered));memset(low,0,sizeof(low));memset(critical,0,sizeof(critical));timer=0;
  dfs(0,-1);int answer=0;for(int i=0;i<n;i++)answer+=critical[i];printf("%d\n",answer);
 }
 return 0;
}
