#include <stdio.h>
#define MOD 1000000007LL
static long long factorial[1001],inverse[1001];
static long long power(long long a,long long exponent){
 long long result=1;
 while(exponent){if(exponent&1)result=result*a%MOD;a=a*a%MOD;exponent>>=1;}
 return result;
}
static long long choose(int n,int k){return factorial[n]*inverse[k]%MOD*inverse[n-k]%MOD;}
int main(void){
 factorial[0]=1;
 for(int i=1;i<=1000;i++)factorial[i]=factorial[i-1]*i%MOD;
 inverse[1000]=power(factorial[1000],MOD-2);
 for(int i=1000;i>0;i--)inverse[i-1]=inverse[i]*i%MOD;
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int tc=1;tc<=tests;tc++){
  int n,m,k;scanf("%d %d %d",&n,&m,&k);long long valid=0;
  for(int j=0;j<=m-k;j++){
   long long term=choose(m-k,j)*factorial[n-k-j]%MOD;
   valid=(valid+(j&1?MOD-term:term))%MOD;
  }
  printf("Case %d: %lld\n",tc,choose(m,k)*valid%MOD);
 }
 return 0;
}
