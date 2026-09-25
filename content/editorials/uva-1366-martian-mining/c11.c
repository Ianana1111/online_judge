#include <stdio.h>
static long long west[501][501],north[501][501],dp[501];
int main(void){
 int n,m;
 while(scanf("%d %d",&n,&m)==2&&(n||m)){
  for(int i=1;i<=n;i++)for(int j=1;j<=m;j++){
   scanf("%lld",&west[i][j]);west[i][j]+=west[i][j-1];
  }
  for(int i=1;i<=n;i++)for(int j=1;j<=m;j++){
   scanf("%lld",&north[i][j]);north[i][j]+=north[i-1][j];
  }
  for(int j=0;j<=m;j++)dp[j]=0;
  for(int i=1;i<=n;i++)for(int j=1;j<=m;j++){
   long long fromAbove=dp[j]+west[i][j],fromLeft=dp[j-1]+north[i][j];
   dp[j]=fromAbove>fromLeft?fromAbove:fromLeft;
  }
  printf("%lld\n",dp[m]);
 }
 return 0;
}
