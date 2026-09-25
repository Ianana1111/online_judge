#include <stdio.h>
static long long power3[31];
static long long prefix(int k,long long rows){
 if(rows==0)return 0;
 if(k==0)return 1;
 long long half=1LL<<(k-1);
 if(rows<=half)return 2*prefix(k-1,rows);
 return 2*power3[k-1]+prefix(k-1,rows-half);
}
int main(void){
 power3[0]=1;for(int i=1;i<=30;i++)power3[i]=power3[i-1]*3;
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int tc=1;tc<=tests;tc++){
  int k;long long a,b;scanf("%d %lld %lld",&k,&a,&b);
  printf("Case %d: %lld\n",tc,prefix(k,b)-prefix(k,a-1));
 }
 return 0;
}
