#include <stdio.h>
int main(void){
 long long n;
 while(scanf("%lld",&n)==1&&n){
  long long answer=0;
  for(long long left=1;left<=n;){
   long long quotient=n/left,right=n/quotient;
   long long sum=(left+right)*(right-left+1)/2;
   answer+=sum*quotient;left=right+1;
  }
  printf("%lld\n",answer-1);
 }
 return 0;
}
