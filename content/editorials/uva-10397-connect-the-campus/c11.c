#include <limits.h>
#include <math.h>
#include <stdio.h>
static long long x[750],y[750],best[750];
static unsigned char connected[750][750],used[750];
int main(void){
 int n;
 while(scanf("%d",&n)==1){
  for(int i=0;i<n;i++){scanf("%lld %lld",&x[i],&y[i]);best[i]=LLONG_MAX;used[i]=0;
   for(int j=0;j<n;j++)connected[i][j]=0;}
  int m;scanf("%d",&m);
  while(m--){int a,b;scanf("%d %d",&a,&b);a--;b--;connected[a][b]=connected[b][a]=1;}
  best[0]=0;double total=0;
  for(int step=0;step<n;step++){
   int u=-1;for(int i=0;i<n;i++)if(!used[i]&&(u<0||best[i]<best[u]))u=i;
   used[u]=1;total+=sqrt((double)best[u]);
   for(int v=0;v<n;v++)if(!used[v]){
    long long dx=x[u]-x[v],dy=y[u]-y[v];
    long long weight=connected[u][v]?0:dx*dx+dy*dy;
    if(weight<best[v])best[v]=weight;
   }
  }
  printf("%.2f\n",total);
 }
 return 0;
}
