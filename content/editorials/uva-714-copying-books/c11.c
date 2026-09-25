#include <stdio.h>
static long long pages[500];static int split[500];
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  int n,k;scanf("%d %d",&n,&k);long long low=0,high=0;
  for(int i=0;i<n;i++){
   scanf("%lld",&pages[i]);
   if(pages[i]>low)low=pages[i];high+=pages[i];split[i]=0;
  }
  while(low<high){
   long long limit=low+(high-low)/2,current=0;int groups=1;
   for(int i=0;i<n;i++){
    if(current+pages[i]>limit){groups++;current=0;}current+=pages[i];
   }
   if(groups<=k)high=limit;else low=limit+1;
  }
  long long current=0;int groups=k;
  for(int i=n-1;i>=0;i--){
   if(current+pages[i]>low||i+1<groups){split[i]=1;groups--;current=0;}
   current+=pages[i];
  }
  for(int i=0;i<n;i++){
   if(i)putchar(' ');printf("%lld",pages[i]);if(split[i])printf(" /");
  }
  putchar('\n');
 }
 return 0;
}
