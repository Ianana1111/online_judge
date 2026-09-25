#include <stdio.h>
#include <stdlib.h>
#define BOUND 1000000
#define LIMIT 999999999999LL
static unsigned char composite[BOUND+1];
static long long powers[100000];static int count;
static int compare(const void*a,const void*b){
 long long x=*(const long long*)a,y=*(const long long*)b;return x<y?-1:x>y?1:0;
}
static int lower(long long x){int lo=0,hi=count;while(lo<hi){int m=(lo+hi)/2;if(powers[m]<x)lo=m+1;else hi=m;}return lo;}
static int upper(long long x){int lo=0,hi=count;while(lo<hi){int m=(lo+hi)/2;if(powers[m]<=x)lo=m+1;else hi=m;}return lo;}
int main(void){
 for(int p=2;p*p<=BOUND;p++)if(!composite[p])for(int x=p*p;x<=BOUND;x+=p)composite[x]=1;
 for(int p=2;p<=BOUND;p++)if(!composite[p]){
  long long value=(long long)p*p;
  while(value<=LIMIT){powers[count++]=value;if(value>LIMIT/p)break;value*=p;}
 }
 qsort(powers,count,sizeof(long long),compare);
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){long long low,high;scanf("%lld %lld",&low,&high);printf("%d\n",upper(high)-lower(low));}
 return 0;
}
