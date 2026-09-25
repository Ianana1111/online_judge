#include <stdio.h>
#include <stdlib.h>
static long long values[1000];
static int compare_long(const void *left,const void *right){long long a=*(const long long*)left,b=*(const long long*)right;return (a>b)-(a<b);}
static int lower_bound(long long *keys,int count,long long wanted){
 int lo=0,hi=count;while(lo<hi){int mid=lo+(hi-lo)/2;if(keys[mid]<wanted)lo=mid+1;else hi=mid;}return lo;
}
int main(void){
 int n;while(scanf("%d",&n)==1&&n){
  for(int i=0;i<n;i++)scanf("%lld",&values[i]);qsort(values,n,sizeof(long long),compare_long);
  int count=n*(n-1)/2;long long *keys=malloc((size_t)count*sizeof(long long));int at=0;
  for(int i=0;i<n;i++)for(int j=i+1;j<n;j++){
   keys[at++]=((values[i]+values[j]+(1LL<<30))<<20)|((long long)i<<10)|j;
  }
  qsort(keys,count,sizeof(long long),compare_long);
  int found=0;long long answer=0;
  for(int d=n-1;d>=0&&!found;d--)for(int c=0;c<n&&!found;c++)if(c!=d){
   long long wanted=(values[d]-values[c]+(1LL<<30))<<20;
   for(int pos=lower_bound(keys,count,wanted);pos<count&&(keys[pos]>>20)==(wanted>>20);pos++){
    int i=(int)((keys[pos]>>10)&1023),j=(int)(keys[pos]&1023);
    if(i!=c&&i!=d&&j!=c&&j!=d){answer=values[d];found=1;break;}
   }
  }
  if(found)printf("%lld\n",answer);else puts("no solution");free(keys);
 }
 return 0;
}
