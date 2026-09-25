#include <stdio.h>
static int coverage(int limit,const int *stamps,int count){
 int maximum=limit*stamps[count-1],dp[1001];for(int i=0;i<=maximum;i++)dp[i]=limit+1;dp[0]=0;
 for(int amount=1;amount<=maximum;amount++){
  for(int i=0;i<count;i++)if(stamps[i]<=amount&&dp[amount-stamps[i]]+1<dp[amount])dp[amount]=dp[amount-stamps[i]]+1;
  if(dp[amount]>limit)return amount-1;
 }
 return maximum;
}
int main(void){
 int limit;while(scanf("%d",&limit)==1&&limit){
  int n;scanf("%d",&n);int best_coverage=-1,best_count=0,best[10]={0};
  while(n--){int count,candidate[10];scanf("%d",&count);for(int i=0;i<count;i++)scanf("%d",&candidate[i]);
   int covered=coverage(limit,candidate,count),better=covered>best_coverage;
   if(covered==best_coverage){
    if(count!=best_count)better=count<best_count;
    else for(int i=count-1;i>=0;i--)if(candidate[i]!=best[i]){better=candidate[i]<best[i];break;}
   }
   if(better){best_coverage=covered;best_count=count;for(int i=0;i<count;i++)best[i]=candidate[i];}
  }
  printf("max coverage =%4d :",best_coverage);for(int i=0;i<best_count;i++)printf("%3d",best[i]);putchar('\n');
 }
 return 0;
}
