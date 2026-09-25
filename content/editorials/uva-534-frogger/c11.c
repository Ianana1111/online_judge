#include <limits.h>
#include <math.h>
#include <stdio.h>
static long long x[200],y[200],best[200];static unsigned char used[200];
int main(void){
 int n,scenario=0;
 while(scanf("%d",&n)==1&&n){
  for(int i=0;i<n;i++){scanf("%lld %lld",&x[i],&y[i]);best[i]=LLONG_MAX;used[i]=0;}
  best[0]=0;
  for(int step=0;step<n;step++){
   int u=-1;
   for(int i=0;i<n;i++)if(!used[i]&&(u<0||best[i]<best[u]))u=i;
   used[u]=1;if(u==1)break;
   for(int v=0;v<n;v++)if(!used[v]){
    long long dx=x[u]-x[v],dy=y[u]-y[v],square=dx*dx+dy*dy;
    long long candidate=best[u]>square?best[u]:square;
    if(candidate<best[v])best[v]=candidate;
   }
  }
  printf("Scenario #%d\nFrog Distance = %.3f\n\n",++scenario,sqrt((double)best[1]));
 }
 return 0;
}
