#include <stdio.h>
#include <stdlib.h>
#include <string.h>
static char word[100001];static int next[100001][26];
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  scanf("%100000s",word);int n=strlen(word);
  for(int c=0;c<26;c++)next[n][c]=n;
  for(int i=n-1;i>=0;i--){
   memcpy(next[i],next[i+1],sizeof(next[i]));next[i][word[i]-'A']=i;
  }
  int answer=0;
  for(int a=0;a<26;a++){
   int first=next[0][a];if(first==n)continue;
   for(int b=0;b<26;b++){
    int second=next[first+1][b];if(second==n)continue;
    for(int c=0;c<26;c++)if(next[second+1][c]<n)answer++;
   }
  }
  printf("%d\n",answer);
 }
 return 0;
}
