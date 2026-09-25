#include <stdio.h>
static unsigned char prime[1000000];static int prefix[1000000];
int main(void){
 for(int i=2;i<1000000;i++)prime[i]=1;
 for(int p=2;p*p<1000000;p++)if(prime[p])for(int v=p*p;v<1000000;v+=p)prime[v]=0;
 for(int value=100;value<1000000;value++){
  int good=prime[value],power=1,length=1;
  for(int rest=value;rest>=10;rest/=10){power*=10;length++;}
  int rotated=value;
  for(int shift=1;good&&shift<length;shift++){
   rotated=(rotated%power)*10+rotated/power;
   if(!prime[rotated])good=0;
  }
  prefix[value]=prefix[value-1]+good;
 }
 int left,right;while(scanf("%d",&left)==1&&left!=-1){
  scanf("%d",&right);int count=prefix[right]-prefix[left-1];
  if(count==0)puts("No Circular Primes.");
  else if(count==1)puts("1 Circular Prime.");
  else printf("%d Circular Primes.\n",count);
 }
 return 0;
}
