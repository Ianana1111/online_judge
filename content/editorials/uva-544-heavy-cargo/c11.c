#include <stdio.h>
#include <string.h>
static char names[200][32];static int capacity[200][200],best[200],settled[200];
static int count;
static int index_of(const char*name){
 for(int i=0;i<count;i++)if(strcmp(names[i],name)==0)return i;
 strcpy(names[count],name);return count++;
}
int main(void){
 int n,r,scenario=0;
 while(scanf("%d %d",&n,&r)==2&&(n||r)){
  count=0;for(int i=0;i<n;i++){best[i]=settled[i]=0;for(int j=0;j<n;j++)capacity[i][j]=0;}
  for(int i=0;i<r;i++){
   char a[32],b[32];int weight;scanf("%31s %31s %d",a,b,&weight);
   int u=index_of(a),v=index_of(b);
   if(weight>capacity[u][v])capacity[u][v]=capacity[v][u]=weight;
  }
  char from[32],to[32];scanf("%31s %31s",from,to);
  int start=index_of(from),target=index_of(to);best[start]=10001;
  for(int step=0;step<n;step++){
   int u=-1;for(int v=0;v<n;v++)if(!settled[v]&&(u<0||best[v]>best[u]))u=v;
   if(u<0||best[u]==0)break;settled[u]=1;
   for(int v=0;v<n;v++){
    int candidate=best[u]<capacity[u][v]?best[u]:capacity[u][v];
    if(candidate>best[v])best[v]=candidate;
   }
  }
  printf("Scenario #%d\n%d tons\n\n",++scenario,best[target]);
 }
 return 0;
}
