#include <stdio.h>
#define MOD 1000007
static int choose[401][401];
int main(void){
 choose[0][0]=1;
 for(int n=1;n<=400;n++){
  choose[n][0]=choose[n][n]=1;
  for(int k=1;k<n;k++)choose[n][k]=(choose[n-1][k-1]+choose[n-1][k])%MOD;
 }
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int tc=1;tc<=tests;tc++){
  int rows,cols,k;scanf("%d %d %d",&rows,&cols,&k);long long answer=0;
  for(int mask=0;mask<16;mask++){
   int r=rows-!!(mask&1)-!!(mask&2),c=cols-!!(mask&4)-!!(mask&8);
   int cells=r*c,ways=k>cells?0:choose[cells][k],bits=0;
   for(int b=0;b<4;b++)bits+=(mask>>b)&1;
   answer+=bits%2?-ways:ways;
  }
  answer=(answer%MOD+MOD)%MOD;
  printf("Case %d: %lld\n",tc,answer);
 }
 return 0;
}
