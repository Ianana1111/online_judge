#include <stdio.h>
#include <stdlib.h>
static int values[500000],sorted[500000],tree[500001];
static int compare(const void*a,const void*b){int x=*(const int*)a,y=*(const int*)b;return x<y?-1:x>y?1:0;}
static int lower(int n,int x){int lo=0,hi=n;while(lo<hi){int m=(lo+hi)/2;if(sorted[m]<x)lo=m+1;else hi=m;}return lo+1;}
static void add(int n,int at){for(;at<=n;at+=at&-at)tree[at]++;}
static int prefix(int at){int result=0;for(;at>0;at-=at&-at)result+=tree[at];return result;}
int main(void){
 int n;
 while(scanf("%d",&n)==1&&n){
  for(int i=0;i<n;i++){scanf("%d",&values[i]);sorted[i]=values[i];tree[i+1]=0;}
  qsort(sorted,n,sizeof(int),compare);long long answer=0;
  for(int i=0;i<n;i++){int rank=lower(n,values[i]);answer+=i-prefix(rank);add(n,rank);}
  printf("%lld\n",answer);
 }
 return 0;
}
