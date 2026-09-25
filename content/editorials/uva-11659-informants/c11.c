#include <stdio.h>
static int positive[20],negative[20];
int main(void){
 int n,a;
 while(scanf("%d %d",&n,&a)==2&&(n||a)){
  for(int i=0;i<n;i++)positive[i]=negative[i]=0;
  while(a--){int speaker,target;scanf("%d %d",&speaker,&target);speaker--;
   if(target>0)positive[speaker]|=1<<(target-1);
   else negative[speaker]|=1<<(-target-1);
  }
  int best=0;
  for(int mask=0;mask<(1<<n);mask++){
   int count=__builtin_popcount((unsigned)mask);if(count<=best)continue;
   int valid=1;
   for(int i=0;i<n&&valid;i++)if(mask&(1<<i))
    if((positive[i]&mask)!=positive[i]||(negative[i]&mask))valid=0;
   if(valid)best=count;
   if(best==n)break;
  }
  printf("%d\n",best);
 }
 return 0;
}
