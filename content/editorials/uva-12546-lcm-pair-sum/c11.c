#include <stdio.h>
#define MOD 1000000007LL
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int tc=1;tc<=tests;tc++){
  int count;scanf("%d",&count);long long ordered=1,number=1;
  while(count--){
   long long prime;int exponent;scanf("%lld %d",&prime,&exponent);
   long long power=1,lower=0;
   for(int i=0;i<exponent;i++){lower=(lower+power)%MOD;power=power*prime%MOD;}
   long long factor=(lower+(exponent+1)*power)%MOD;
   ordered=ordered*factor%MOD;number=number*power%MOD;
  }
  printf("Case %d: %lld\n",tc,(ordered+number)%MOD);
 }
 return 0;
}
