#include <stdio.h>
#include <stdlib.h>
typedef struct{long long x,y,height;}Block;
static int compare(const void *left,const void *right){
 const Block *a=left,*b=right;
 if(a->x!=b->x)return (a->x>b->x)-(a->x<b->x);
 return (a->y>b->y)-(a->y<b->y);
}
int main(void){
 int n,tc=0;while(scanf("%d",&n)==1&&n){
  Block *blocks=malloc((size_t)3*n*sizeof(Block));int count=0;
  for(int i=0;i<n;i++){long long d[3];scanf("%lld %lld %lld",&d[0],&d[1],&d[2]);
   for(int h=0;h<3;h++){long long x=d[(h+1)%3],y=d[(h+2)%3];if(x>y){long long temp=x;x=y;y=temp;}
    blocks[count++]=(Block){x,y,d[h]};
   }
  }
  qsort(blocks,count,sizeof(Block),compare);long long *best=malloc((size_t)count*sizeof(long long)),answer=0;
  for(int i=0;i<count;i++){best[i]=blocks[i].height;
   for(int j=0;j<i;j++)if(blocks[j].x<blocks[i].x&&blocks[j].y<blocks[i].y){
    long long candidate=blocks[i].height+best[j];if(candidate>best[i])best[i]=candidate;
   }
   if(best[i]>answer)answer=best[i];
  }
  printf("Case %d: maximum height = %lld\n",++tc,answer);free(blocks);free(best);
 }
 return 0;
}
