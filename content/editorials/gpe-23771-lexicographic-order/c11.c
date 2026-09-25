#include <stdio.h>
#include <string.h>
static unsigned long long factorial[21];
int main(void){
 factorial[0]=1;for(int i=1;i<=20;i++)factorial[i]=factorial[i-1]*i;
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int tc=1;tc<=tests;tc++){
  char word[24],order[24];unsigned long long rank;
  scanf("%23s %llu",word,&rank);int n=strlen(word);rank--;
  int available[20];for(int i=0;i<n;i++)available[i]=i;
  for(int i=0;i<n;i++){
   int index=rank/factorial[n-i-1];rank%=factorial[n-i-1];
   order[available[index]]=word[i];
   for(int j=index;j<n-i-1;j++)available[j]=available[j+1];
  }
  order[n]=0;printf("Case %d: %s\n",tc,order);
 }
 return 0;
}
