#include <stdio.h>
#include <stdlib.h>
static int h,k,best;
static void search(int used,int last,int coverage,const int *coins){
 if(used==k){if(coverage>best)best=coverage;return;}
 int upper=coverage;for(int left=used;left<k;left++)upper=h*(upper+1);
 if(upper<=best)return;
 for(int denomination=coverage+1;denomination>last;denomination--){
  int size=h*denomination+1,*next=malloc((size_t)size*sizeof(int));
  for(int i=0;i<size;i++)next[i]=h+1;
  int old=h*last+1;for(int i=0;i<old&&i<size;i++)next[i]=coins[i];
  for(int value=denomination;value<size;value++)if(next[value-denomination]+1<next[value])next[value]=next[value-denomination]+1;
  int range=coverage;while(range+1<size&&next[range+1]<=h)range++;
  search(used+1,denomination,range,next);free(next);
 }
}
int main(void){
 int cache[10][10];for(int i=0;i<10;i++)for(int j=0;j<10;j++)cache[i][j]=-1;
 while(scanf("%d %d",&h,&k)==2&&(h||k)){
  if(cache[h][k]<0){best=0;int *coins=malloc((size_t)(h+1)*sizeof(int));for(int i=0;i<=h;i++)coins[i]=i;
   search(1,1,h,coins);cache[h][k]=best;free(coins);
  }
  printf("%d\n",cache[h][k]);
 }
 return 0;
}
