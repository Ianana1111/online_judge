#include <stdio.h>
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  long long n,m;scanf("%lld %lld",&n,&m);
  long long excess=m-(n-1),low=1,high=n;
  while(low<high){
   long long mid=(low+high)/2;
   if((mid-1)*(mid-2)/2>=excess)high=mid;
   else low=mid+1;
  }
  printf("%lld\n",n-low);
 }
 return 0;
}
