#include <stdio.h>
static signed char side[100][101],result[100];
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int t=0;t<tests;t++){
  int n,k;scanf("%d %d",&n,&k);
  for(int j=0;j<k;j++){
   for(int coin=1;coin<=n;coin++)side[j][coin]=0;
   int count,coin;scanf("%d",&count);
   for(int i=0;i<count;i++){scanf("%d",&coin);side[j][coin]=1;}
   for(int i=0;i<count;i++){scanf("%d",&coin);side[j][coin]=-1;}
   char symbol;scanf(" %c",&symbol);result[j]=symbol=='<'?-1:symbol=='>'?1:0;
  }
  int candidates=0,answer=0;
  for(int coin=1;coin<=n;coin++){
   int possible=0;
   for(int direction=-1;direction<=1;direction+=2){
    int consistent=1;
    for(int j=0;j<k;j++)if(side[j][coin]*direction!=result[j]){consistent=0;break;}
    if(consistent)possible=1;
   }
   if(possible){candidates++;answer=coin;}
  }
  if(t)putchar('\n');printf("%d\n",candidates==1?answer:0);
 }
 return 0;
}
