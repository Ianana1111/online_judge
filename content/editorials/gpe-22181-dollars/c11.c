#include <stdio.h>
#include <stdlib.h>
#include <string.h>
static long long ways[6001];
int main(void){
 int coins[]={1,2,4,10,20,40,100,200,400,1000,2000};ways[0]=1;
 for(int i=0;i<11;i++)for(int sum=coins[i];sum<=6000;sum++)ways[sum]+=ways[sum-coins[i]];
 char token[32];
 while(scanf("%31s",token)==1){
  char*dot=strchr(token,'.');int whole=0,small=0;
  if(dot){*dot=0;whole=atoi(token);char*fraction=dot+1;
   small=(fraction[0]?fraction[0]-'0':0)*10+(fraction[1]?fraction[1]-'0':0);
  }else whole=atoi(token);
  int cents=whole*100+small;if(cents==0)break;
  char amount[32];snprintf(amount,sizeof(amount),"%d.%02d",cents/100,cents%100);
  printf("%6s%17lld\n",amount,ways[cents/5]);
 }
 return 0;
}
