#include <stdio.h>
#include <stdlib.h>
static int a[1000],frequency[1001];
static int descending(const void*x,const void*y){int a=*(const int*)x,b=*(const int*)y;return a>b?-1:a<b?1:0;}
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  int m,n;scanf("%d %d",&m,&n);
  for(int i=0;i<m;i++)scanf("%d",&a[i]);
  for(int i=0;i<=m;i++)frequency[i]=0;
  long long excess=0;
  for(int j=0;j<n;j++){int b;scanf("%d",&b);frequency[b]++;excess+=b;}
  qsort(a,m,sizeof(int),descending);
  long long prefix=0,answer=excess;int positive=n-frequency[0];
  for(int k=1;k<=m;k++){
   excess-=positive;positive-=frequency[k];prefix+=a[k-1];
   if(prefix+excess>answer)answer=prefix+excess;
  }
  printf("%lld\n",answer);
 }
 return 0;
}
