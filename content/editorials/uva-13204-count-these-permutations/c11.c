#include <stdio.h>
#define MOD 1000000007LL
static int queries[1000];static long long factorial[500002];
int main(void){
 int count=0,n,largest=0;
 while(scanf("%d",&n)==1){queries[count++]=n;if(n/2>largest)largest=n/2;}
 factorial[0]=1;
 for(int i=1;i<=largest+1;i++)factorial[i]=factorial[i-1]*i%MOD;
 for(int i=0;i<count;i++){
  n=queries[i];long long f=factorial[n/2],answer=f*f%MOD;
  if(n%2)answer=answer*n%MOD;
  printf("%lld\n",answer);
 }
 return 0;
}
