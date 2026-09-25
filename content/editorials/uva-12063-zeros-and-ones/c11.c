#include <stdio.h>
#include <string.h>
static unsigned long long dp[33][100],next[33][100];
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int t=1;t<=tests;t++){
  int n,k;scanf("%d %d",&n,&k);unsigned long long answer=0;
  if(n%2==0&&k>0){
   int half=n/2;memset(dp,0,sizeof(dp));dp[1][1%k]=1;
   for(int length=1;length<n;length++){
    memset(next,0,sizeof(next));
    for(int ones=0;ones<=half;ones++)for(int residue=0;residue<k;residue++){
     unsigned long long ways=dp[ones][residue];if(!ways)continue;
     next[ones][2*residue%k]+=ways;
     if(ones<half)next[ones+1][(2*residue+1)%k]+=ways;
    }
    memcpy(dp,next,sizeof(dp));
   }
   answer=dp[half][0];
  }
  printf("Case %d: %llu\n",t,answer);
 }
 return 0;
}
