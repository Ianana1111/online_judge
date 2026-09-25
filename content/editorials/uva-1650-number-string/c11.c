#include <stdio.h>
#define MOD 1000000007LL
static char signature[1005];
static long long previous[1002],current[1002],prefix[1002];
int main(void){
 while(scanf("%1004s",signature)==1){
  int size=1;previous[0]=1;
  for(int i=0;signature[i];i++){
   prefix[0]=0;
   for(int j=0;j<size;j++)prefix[j+1]=(prefix[j]+previous[j])%MOD;
   for(int j=0;j<=size;j++){
    if(signature[i]=='I')current[j]=prefix[j];
    else if(signature[i]=='D')current[j]=(prefix[size]-prefix[j]+MOD)%MOD;
    else current[j]=prefix[size];
   }
   size++;
   for(int j=0;j<size;j++)previous[j]=current[j];
  }
  long long answer=0;for(int j=0;j<size;j++)answer=(answer+previous[j])%MOD;
  printf("%lld\n",answer);
 }
 return 0;
}
