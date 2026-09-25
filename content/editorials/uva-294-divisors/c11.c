#include <stdio.h>
#include <stdlib.h>
static int composite[31623],primes[4000],prime_count;
static long long remaining[10001];
static int counts[10001];
int main(void){
 for(int p=2;p<=31622;p++)if(!composite[p]){
  primes[prime_count++]=p;
  if((long long)p*p<=31622)for(int x=p*p;x<=31622;x+=p)composite[x]=1;
 }
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  long long low,high;scanf("%lld %lld",&low,&high);int length=high-low+1;
  for(int i=0;i<length;i++){remaining[i]=low+i;counts[i]=1;}
  for(int i=0;i<prime_count;i++){
   long long p=primes[i];if(p*p>high)break;
   for(long long value=(low+p-1)/p*p;value<=high;value+=p){
    int at=value-low,exponent=0;
    while(remaining[at]%p==0){remaining[at]/=p;exponent++;}
    counts[at]*=exponent+1;
   }
  }
  int best=0;
  for(int i=0;i<length;i++){
   if(remaining[i]>1)counts[i]*=2;
   if(counts[i]>counts[best])best=i;
  }
  printf("Between %lld and %lld, %lld has a maximum of %d divisors.\n",low,high,low+best,counts[best]);
 }
 return 0;
}
