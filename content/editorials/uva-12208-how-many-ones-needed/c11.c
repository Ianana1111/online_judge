#include <stdio.h>
static long long prefix(long long n){
 if(n<0)return 0;
 long long total=0,count=n+1;
 for(long long bit=1;bit<=n;bit*=2){
  long long period=bit*2,remainder=count%period;
  total+=count/period*bit;
  if(remainder>bit)total+=remainder-bit;
 }
 return total;
}
int main(void){
 long long left,right;int tc=0;
 while(scanf("%lld %lld",&left,&right)==2&&(left||right))
  printf("Case %d: %lld\n",++tc,prefix(right)-prefix(left-1));
 return 0;
}
