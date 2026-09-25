#include <limits.h>
#include <stdio.h>
static long long capacity[101][101];
int main(void){
 int n,roads,tc=0;
 while(scanf("%d %d",&n,&roads)==2&&(n||roads)){
  for(int i=1;i<=n;i++)for(int j=1;j<=n;j++)capacity[i][j]=i==j?LLONG_MAX:0;
  while(roads--){int a,b;long long seats;scanf("%d %d %lld",&a,&b,&seats);
   if(seats>capacity[a][b])capacity[a][b]=capacity[b][a]=seats;}
  int start,target;long long tourists;scanf("%d %d %lld",&start,&target,&tourists);
  for(int via=1;via<=n;via++)for(int a=1;a<=n;a++)for(int b=1;b<=n;b++){
   long long candidate=capacity[a][via]<capacity[via][b]?capacity[a][via]:capacity[via][b];
   if(candidate>capacity[a][b])capacity[a][b]=candidate;
  }
  long long trips=0;
  if(start!=target){long long usable=capacity[start][target]-1;trips=tourists/usable+(tourists%usable!=0);}
  printf("Scenario #%d\nMinimum Number of Trips = %lld\n\n",++tc,trips);
 }
 return 0;
}
