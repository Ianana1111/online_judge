#include <stdio.h>
static int position[62501],tails[62501];
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int tc=1;tc<=tests;tc++){
  int n,p,q;scanf("%d %d %d",&n,&p,&q);
  for(int i=0;i<=n*n;i++)position[i]=-1;
  for(int i=0;i<=p;i++){int value;scanf("%d",&value);position[value]=i;}
  int size=0;
  for(int i=0;i<=q;i++){
   int value;scanf("%d",&value);int rank=position[value];if(rank<0)continue;
   int lo=0,hi=size;
   while(lo<hi){int mid=(lo+hi)/2;if(tails[mid]<rank)lo=mid+1;else hi=mid;}
   tails[lo]=rank;if(lo==size)size++;
  }
  printf("Case %d: %d\n",tc,size);
 }
 return 0;
}
