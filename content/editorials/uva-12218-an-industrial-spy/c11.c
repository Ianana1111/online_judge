#include <stdio.h>
#include <string.h>
static unsigned char prime[10000000];static int remaining[10],answer,length;
static void search(int value,int used){
 if(prime[value])answer++;
 if(used==length)return;
 for(int digit=0;digit<=9;digit++)if(remaining[digit]){
  if(used==0&&digit==0)continue;
  remaining[digit]--;search(value*10+digit,used+1);remaining[digit]++;
 }
}
int main(void){
 for(int i=2;i<10000000;i++)prime[i]=1;
 for(int p=2;p*p<10000000;p++)if(prime[p])for(int v=p*p;v<10000000;v+=p)prime[v]=0;
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){char digits[8];scanf("%7s",digits);length=(int)strlen(digits);answer=0;
  for(int i=0;i<10;i++)remaining[i]=0;
  for(int i=0;i<length;i++)remaining[digits[i]-'0']++;
  search(0,0);printf("%d\n",answer);
 }
 return 0;
}
