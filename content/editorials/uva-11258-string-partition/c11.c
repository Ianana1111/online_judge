#include <stdio.h>
#include <string.h>
static long long best[201];
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  char digits[201];scanf("%200s",digits);int n=strlen(digits);best[n]=0;
  for(int i=n-1;i>=0;i--){
   best[i]=0;
   if(digits[i]=='0'){best[i]=best[i+1];continue;}
   long long value=0;
   for(int j=i;j<n&&j<i+10;j++){
    value=value*10+digits[j]-'0';if(value>2147483647LL)break;
    if(value+best[j+1]>best[i])best[i]=value+best[j+1];
   }
  }
  printf("%lld\n",best[0]);
 }
 return 0;
}
