#include <stdio.h>
#include <stdlib.h>
typedef struct{int start,end,profit;} Ad;
static Ad ads[30000];static int ends[30000];static long long best[30001];
static int compare(const void*a,const void*b){
 int x=((const Ad*)a)->end,y=((const Ad*)b)->end;return x<y?-1:x>y?1:0;
}
static int upper(int count,int value){int lo=0,hi=count;
 while(lo<hi){int mid=(lo+hi)/2;if(ends[mid]<=value)lo=mid+1;else hi=mid;}return lo;}
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int tc=1;tc<=tests;tc++){
  int n;scanf("%d",&n);
  for(int i=0;i<n;i++){int length;scanf("%d %d %d",&ads[i].start,&length,&ads[i].profit);ads[i].end=ads[i].start+length;}
  qsort(ads,n,sizeof(Ad),compare);
  for(int i=0;i<n;i++)ends[i]=ads[i].end;
  best[0]=0;
  for(int i=1;i<=n;i++){
   int compatible=upper(i-1,ads[i-1].start);
   long long take=best[compatible]+ads[i-1].profit;
   best[i]=best[i-1]>take?best[i-1]:take;
  }
  printf("Case %d: %lld\n",tc,best[n]);
 }
 return 0;
}
