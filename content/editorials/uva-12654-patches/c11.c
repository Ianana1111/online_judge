#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
static int compare_int(const void *left,const void *right){int a=*(const int*)left,b=*(const int*)right;return (a>b)-(a<b);}
int main(void){
 int n,c,t1,t2;while(scanf("%d %d %d %d",&n,&c,&t1,&t2)==4){
  int *hole=malloc((size_t)2*n*sizeof(int)),*next1=malloc((size_t)2*n*sizeof(int)),*next2=malloc((size_t)2*n*sizeof(int));
  long long *dp=malloc((size_t)(2*n+1)*sizeof(long long));
  for(int i=0;i<n;i++)scanf("%d",&hole[i]);qsort(hole,n,sizeof(int),compare_int);
  for(int i=0;i<n;i++)hole[n+i]=hole[i]+c;
  int lengths[2]={t1,t2};int *nexts[2]={next1,next2};
  for(int kind=0;kind<2;kind++){int pointer=0;
   for(int i=0;i<2*n;i++){
    while(pointer<2*n&&hole[pointer]<=hole[i]+lengths[kind])pointer++;
    nexts[kind][i]=pointer;
   }
  }
  long long answer=LLONG_MAX;
  for(int start=0;start<n;start++){
   int end=start+n;dp[end]=0;
   for(int i=end-1;i>=start;i--){
    int a=next1[i]<end?next1[i]:end,b=next2[i]<end?next2[i]:end;
    long long first=t1+dp[a],second=t2+dp[b];dp[i]=first<second?first:second;
   }
   if(dp[start]<answer)answer=dp[start];
  }
  printf("%lld\n",answer);free(hole);free(next1);free(next2);free(dp);
 }
 return 0;
}
