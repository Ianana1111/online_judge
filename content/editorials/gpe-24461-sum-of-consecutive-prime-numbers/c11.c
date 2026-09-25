#include <stdio.h>
static char prime[10001];static int values[1230];
int main(void){
 for(int i=2;i<=10000;i++)prime[i]=1;
 for(int p=2;p*p<=10000;p++)if(prime[p])
  for(int j=p*p;j<=10000;j+=p)prime[j]=0;
 int count=0;for(int i=2;i<=10000;i++)if(prime[i])values[count++]=i;
 int target;while(scanf("%d",&target)==1&&target){
  int left=0,sum=0,answer=0;
  for(int right=0;right<count&&values[right]<=target;right++){
   sum+=values[right];while(sum>target)sum-=values[left++];
   if(sum==target)answer++;
  }
  printf("%d\n",answer);
 }
 return 0;
}
