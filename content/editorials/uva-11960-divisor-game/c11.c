#include <stdio.h>
#include <stdlib.h>
static int divisors[1000001],best[1000001],queries[50000];
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;int limit=1;
 for(int i=0;i<tests;i++){scanf("%d",&queries[i]);if(queries[i]>limit)limit=queries[i];}
 for(int divisor=1;divisor<=limit;divisor++)
  for(int multiple=divisor;multiple<=limit;multiple+=divisor)divisors[multiple]++;
 int record=1;
 for(int n=1;n<=limit;n++){
  if(divisors[n]>=divisors[record])record=n;
  best[n]=record;
 }
 for(int i=0;i<tests;i++)printf("%d\n",best[queries[i]]);
 return 0;
}
