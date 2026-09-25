#include <stdio.h>
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int tc=0;tc<tests;tc++){
  long long n,m;scanf("%lld %lld",&n,&m);
  if(tc)putchar('\n');
  long long excess=n-m,overlap=(m-1)/2;
  printf("%d\n",(excess&overlap)==0?1:0);
 }
 return 0;
}
